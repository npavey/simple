define(["q", "publishSettings"], function(Q, publishSettings) {
  "use strict";

  function UrlProvider() {
    this.authServiceUrl = "";
    this.learnServiceUrl = "";
    this.courseLink = "";
  }

  UrlProvider.prototype.initialize = initialize;

  var instance = new UrlProvider();

  return instance;

  function initialize() {
    var self = this;
    return Q.fcall(function() {
      self.authServiceUrl = publishSettings.authServiceUrl
        ? publishSettings.authServiceUrl
        : "https://auth-staging.easygenerator.com";
      self.learnServiceUrl = publishSettings.learnServiceUrl
        ? publishSettings.learnServiceUrl
        : "https://learn-staging.easygenerator.com";

      self.courseLink =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "#/";
    });
  }
});
