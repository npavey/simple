define([
  "./httpWrapper",
  "./urlProvider",
  "../constants",
  "helpers/idToUuid"
], function(httpWrapper, urlProvider, constants, idToUuid) {
  "use strict";

  var _private = {
    tokenKey: "token.learn",
    shortTermAccessKey: "shortTermAccess.auth.template",
    getToken: function() {
      return sessionStorage.getItem(_private.tokenKey);
    },
    removeToken: function() {
      sessionStorage.removeItem(_private.tokenKey);
    }
  };

  var auth = {};

  Object.defineProperty(auth, "headers", {
    get: function() {
      return {};
    }
  });

  Object.defineProperty(auth, "authenticated", {
    get: function() {
      return _private.getToken() !== null;
    }
  });

  Object.defineProperty(auth, "shortTermAccess", {
    get: function() {
      return sessionStorage.getItem(_private.shortTermAccessKey) === "true";
    },
    set: function(value) {
      if (typeof value !== "undefined" && value !== "") {
        sessionStorage.setItem(_private.shortTermAccessKey, value);
      } else if (value === "") {
        sessionStorage.removeItem(_private.shortTermAccessKey);
      }
    }
  });

  auth.setToken = function(value) {
    if (typeof value !== "undefined") {
      sessionStorage.setItem(_private.tokenKey, value);
    }
  };

  auth.getToken = function() {
    return _private.getToken();
  };

  auth.exists = function(email) {
    return httpWrapper
      .get(
        urlProvider.authServiceUrl + "/api/account/exists",
        { email },
        {
          "Content-Type": constants.contentTypeJson
        },
        true
      )
      .then(function(response) {
        return response.exists;
      });
  };

  auth.authorize = async function() {
    try {
      const { token } = await httpWrapper.get(
        urlProvider.authServiceUrl + "/api/account/token",
        {},
        {},
        true
      );
      auth.setToken(token);
    } catch (fail) {
      if (fail.status === 401) {
        auth.signout();
      } else {
        console.error(fail);
      }
    }
  };

  auth.identify = async function() {
    try {
      return await httpWrapper.get(
        urlProvider.learnServiceUrl + "/api/learner/me",
        {},
        {
          Authorization: "Bearer " + auth.getToken()
        },
        false
      );
    } catch (fail) {
      if (fail.status === 401) {
        auth.signout();
      } else {
        console.error("User info request fails with error: ", fail);
        return fail;
      }
    }
  };

  auth.signin = function(email, password, rememberMe) {
    return httpWrapper
      .post(
        urlProvider.authServiceUrl + "/api/auth/credentials",
        {
          email: email,
          password: password,
          shortTermAccess: !rememberMe
        },
        {
          "Content-Type": constants.contentTypeJson
        },
        true
      )
      .then(function(response) {
        auth.setToken(response.token);
        auth.shortTermAccess = !rememberMe;
      });
  };

  auth.register = function(email, password, name, rememberMe) {
    return httpWrapper
      .post(
        urlProvider.authServiceUrl + "/api/credentials/register",
        {
          email: email,
          password: password,
          name: name,
          shortTermAccess: !rememberMe
        },
        {
          "Content-Type": constants.contentTypeJson
        },
        true
      )
      .then(function(response) {
        auth.setToken(response.token);
        auth.shortTermAccess = !rememberMe;
      });
  };

  auth.getValueFromUrl = function(key) {
    key = key || "token";
    var url = window.location.href,
      regex = new RegExp("[?&]" + key + "(=([^&#]*)|&|#|$)", "i"),
      result = regex.exec(url);

    if (!result || !result[2]) {
      return null;
    }

    return decodeURIComponent(result[2].replace(/\+/g, " "));
  };

  auth.signout = function() {
    return httpWrapper
      .post(urlProvider.authServiceUrl + "/api/account/logout", {}, {}, true)
      .then(function(response) {
        _private.removeToken();
        auth.shortTermAccess = "";
      })
      .fail(function(fail) {
        console.error("Logout failed with error: ", fail);
      });
  };

  auth.sendSecretLink = function(courseId) {
    return httpWrapper.post(
      urlProvider.learnServiceUrl +
        "/api/learner/me/courses/" +
        idToUuid(courseId) +
        "/send-secret-link",
      {},
      {
        "Content-Type": constants.contentTypeJson,
        Authorization: "Bearer " + _private.getToken()
      },
      false
    );
  };

  auth.forgotpassword = function(email) {
    return httpWrapper.post(
      urlProvider.authServiceUrl + "/api/credentials/forgot-password",
      {
        email: email,
        returnUrl: urlProvider.courseLink
      },
      {
        "Content-Type": constants.contentTypeJson
      }
    );
  };

  return auth;
});
