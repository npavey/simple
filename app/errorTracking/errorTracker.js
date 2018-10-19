define(["underscore", "errorTracking/ravenWrapper", "durandal/app"], function(
  _,
  ravenWrapper,
  app
) {
  function ErrorTracker() {
    return {
      init: init,
      trackError: trackError
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

    function trackError(error) {
      if(!error) {
        return;
      }

      ravenWrapper.captureError(error);
    }
  }
  return new ErrorTracker();
});
