define(['requester/httpWrapper', './urlProvider', '../constants', 'helpers/idToUuid'], function (
  httpWrapper,
  urlProvider,
  constants,
  idToUuid
) {
  'use strict';

  var _private = {
    tokenKey: 'token.learn',
    shortTermAccessKey: 'shortTermAccess.auth.template',
    getToken: function () {
      return sessionStorage.getItem(_private.tokenKey);
    },
    removeToken: function () {
      sessionStorage.removeItem(_private.tokenKey);
    }
  };

  var auth = {};

  Object.defineProperty(auth, 'headers', {
    get: function () {
      return {};
    }
  });

  Object.defineProperty(auth, 'authenticated', {
    get: function () {
      return _private.getToken() !== null;
    }
  });

  Object.defineProperty(auth, 'shortTermAccess', {
    get: function () {
      return sessionStorage.getItem(_private.shortTermAccessKey) === 'true';
    },
    set: function (value) {
      if (typeof value !== 'undefined' && value !== '') {
        sessionStorage.setItem(_private.shortTermAccessKey, value);
      } else if (value === '') {
        sessionStorage.removeItem(_private.shortTermAccessKey);
      }
    }
  });

  auth.setToken = function (value) {
    if (typeof value !== 'undefined' && value !== null) {
      sessionStorage.setItem(_private.tokenKey, value);
    }
  };

  auth.getToken = function () {
    return _private.getToken();
  };

  auth.exists = function (email) {
    return httpWrapper
      .get({
        url: urlProvider.authServiceUrl + '/api/account/exists',
        query: { email: email },
        headers: {
          'Content-Type': constants.contentTypeJson
        },
        withCredentials: true
      })
      .then(function (response) {
        return response.exists;
      });
  };

  auth.authorize = function () {
    return httpWrapper
      .get({
        url: urlProvider.authServiceUrl + '/api/account/token',
        withCredentials: true
      })
      .then(function (response) {
        auth.setToken(response.token);
      })
      .fail(function (fail) {
        auth.setToken('');
        console.error(fail);
      });
  };

  auth.identify = function () {
    return httpWrapper
      .get({
        url: urlProvider.learnServiceUrl + '/api/learner/me',
        headers: {
          Authorization: 'Bearer ' + auth.getToken()
        },
        withCredentials: false
      })
      .fail(function (fail) {
        if (fail.status === 401) {
          return auth.signout();
        }
        console.error('User info request fails with error: ', fail);
      });
  };

  auth.signin = function (email, password, rememberMe) {
    return httpWrapper
      .post({
        url: urlProvider.authServiceUrl + '/api/auth/credentials',
        data: {
          email: email,
          password: password,
          shortTermAccess: !rememberMe
        },
        headers: {
          'Content-Type': constants.contentTypeJson
        },
        withCredentials: true
      })
      .then(function (response) {
        auth.setToken(response.token);
        auth.shortTermAccess = !rememberMe;
      });
  };

  auth.register = function (email, password, name, rememberMe) {
    return httpWrapper
      .post({
        url: urlProvider.authServiceUrl + '/api/credentials/register',
        data: {
          email: email,
          password: password,
          name: name,
          shortTermAccess: !rememberMe
        },
        headers: {
          'Content-Type': constants.contentTypeJson
        },
        withCredentials: true
      })
      .then(function (response) {
        auth.setToken(response.token);
        auth.shortTermAccess = !rememberMe;
      });
  };

  auth.getValueFromUrl = function (key) {
    key = key || 'token';
    var url = window.location.href,
      regex = new RegExp('[?&]' + key + '(=([^&#]*)|&|#|$)', 'i'),
      result = regex.exec(url);

    if (!result || !result[2]) {
      return null;
    }

    return decodeURIComponent(result[2].replace(/\+/g, ' '));
  };

  auth.signout = function () {
    return httpWrapper
      .post({
        url: urlProvider.authServiceUrl + '/api/account/logout',
        withCredentials: true
      })
      .then(function (response) {
        _private.removeToken();
        auth.shortTermAccess = '';
      })
      .fail(function (fail) {
        console.error('Logout failed with error: ', fail);
      });
  };

  auth.sendSecretLink = function (courseId) {
    return httpWrapper.post({
      url: urlProvider.learnServiceUrl + '/api/learner/me/courses/' + idToUuid(courseId) + '/send-secret-link',
      headers: {
        'Content-Type': constants.contentTypeJson,
        Authorization: 'Bearer ' + _private.getToken()
      },
      withCredentials: false
    });
  };

  auth.forgotpassword = function (email) {
    return httpWrapper.post({
      url: urlProvider.authServiceUrl + '/api/credentials/forgot-password',
      data: {
        email: email,
        returnUrl: urlProvider.courseLink
      },
      headers: {
        'Content-Type': constants.contentTypeJson
      }
    });
  };

  return auth;
});
