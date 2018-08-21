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
        logger: "javascript",
        autoBreadcrumbs: {
          xhr: true,
          console: false,
          dom: true,
          location: true
        }
      }).install();

      self.raven.setUserContext({ email: email });
    };
  }
  return new RavenWrapper();
});
