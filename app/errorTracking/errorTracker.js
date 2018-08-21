define(["underscore", "errorTracking/ravenWrapper", "durandal/app"], function(
  _,
  ravenWrapper,
  app
) {
  function ErrorTracker() {
    return {
      init: init
    };

    function init(errorTrackingServiceUrl) {
      if (!errorTrackingServiceUrl) {
        return;
      }

      app
        .on("user:authenticated")
        .then(function (userInfo) {
          ravenWrapper.initialize(errorTrackingServiceUrl, userInfo.email)
        });
    }
  }
  return new ErrorTracker();
});
