define(function() {
  function RavenWrapper() {
    var self = this;

    self.raven = window.Raven;

    self.initialize = function(
      errorTrackingServiceUrl,
      email
    ) {
      if (!self.raven) {
        return;
      }

      self.raven.config(errorTrackingServiceUrl, {
        logger: 'javascript',
        ignoreErrors: [
          'LMSSetValue',
          'LMSInitialize',
          'LMSCommit'
        ],
        ignoreUrls: [
          /vendor\.min\.js/
        ],
        autoBreadcrumbs: {
          xhr: true,
          console: false,
          dom: true,
          location: true
        }
      }).install();

      self.raven.setUserContext({ email: email });
    };

    self.captureError = function(error) {
      if (!self.raven || !error) {
        return;
      }

      self.raven.captureMessage(error, { level: 'error' });
    };
  }
  return new RavenWrapper();
});
