define(['requester/resourceLoader', 'q'], function (resourceLoader, Q) {
  const initialize = function () {
    const dfd = Q.defer();

    resourceLoader
      .getLocalResource({
        url: 'content/data.js',
        requestOptions: {
          contentType: 'application/json',
          dataType: 'json'
        }
      })
      .done(function (response) {
        resourceLoader.cacheBuster = response.createdOn;
        dfd.resolve();
      })
      .fail(function () {
        dfd.reject('Unable to load data.js');
      });

    return dfd.promise;
  };

  return {
    initialize
  };
});
