define(["q", "publishSettings"], function(Q, publishSettings) {
  "use strict";

  function UrlProvider() {
    this.progressStorageUrl = "";
    this.courseLink = "";
  }

  UrlProvider.prototype.initialize = initialize;

  var instance = new UrlProvider();

  return instance;

  function initialize() {
    var self = this;
    return Q.fcall(function() {
      self.progressStorageUrl = publishSettings.progressStorageUrl
        ? "//" + publishSettings.progressStorageUrl + "/"
        : "//progress-storage.easygenerator.com/";

      self.courseLink =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
    });
  }
});
