define(["download", "jquery"], function($) {
  "use strict";

  function downloadFile(url, filename) {
    return fetch(url)
      .then(function(response) {
        if (response.status !== 200) {
          return response.json().then(function(error) {
            if (error && error.message) {
              throw new Error(error.message);
            }
            throw new Error();
          });
        }

        return response.blob();
      })
      .then(function(blob) {
        var isChrome = navigator.userAgent.match("CriOS");
        var isFirefox = navigator.userAgent.match("FxiOS");
        if (!isChrome && !isFirefox) {
          download(blob, filename, blob.type);
        } else {
          //for chrome in apple devices
          var reader = new FileReader();
          var out = new Blob([blob], { type: blob.type });
          reader.onload = function(e) {
            var win = window.open();
            win.document.write(
              '<iframe src="' +
                reader.result +
                '" frameborder="0" style="display: block; width: 100vw; height: 100vh; max-width: 100%;" allowfullscreen />'
            );
          };
          reader.readAsDataURL(out);
        }
      });
  }

  return {
    downloadFile: downloadFile
  };
});
