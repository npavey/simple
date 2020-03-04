define(function() {
  var Query = {
    getValueFromUrl: getValueFromUrl,
    removeQueryStringParam: removeQueryStringParam
  };

  return Query;
  function getValueFromUrl(key) {
    if (!key) {
      throw new Error('Parameter "key" should be specified');
    }

    const url = window.location.href;
    const regex = new RegExp(`[?&]${key}(=([^&#]*)|&|#|$)`, "i");
    const result = regex.exec(url);

    if (!result || !result[2]) {
      return undefined;
    }

    return decodeURIComponent(result[2].replace(/\+/g, " "));
  }
  function removeQueryStringParam(paramName) {
    if (window.location.search.indexOf(paramName) !== -1) {
      const url = `${getCurrentUrl()}${getFilteredQueryParams(
        paramName
      )}${getCurrentLocationHash()}`;

      window.history.replaceState({}, document.title, url);
    }
  }
});
