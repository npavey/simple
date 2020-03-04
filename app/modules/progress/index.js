define([
  "q",
  "underscore",
  "context",
  "userContext",
  "templateSettings",
  "./localStorage/index",
  "./progressStorage/index",
  "./progressStorage/auth",
  "account/limitAccess/accessLimiter",
  "helpers/loginHelper"
], function(
  Q,
  _,
  context,
  userContext,
  templateSettings,
  LocalStorageProvider,
  ProgressStorageProvider,
  auth,
  accessLimiter,
  loginHelper
) {
  "use strict";
  var _psProvider = null,
    _lsProvider = null;

  return {
    initialize: initialize,
    initProgressStorage: initProgressStorage,
    clearLocalStorage: clearLocalStorage
  };

  function initialize() {
    var defer = Q.defer();
    _psProvider = new ProgressStorageProvider(
      context.course.id,
      context.course.templateId
    );
    _lsProvider = new LocalStorageProvider(
      context.course.id,
      context.course.templateId
    );

    if (userContext.user.email) {
      auth.signout();
    }

    if (templateSettings.allowCrossDeviceSaving) {
      var token = loginHelper.token;

      if (!_.isNull(token)) {
        auth.setToken(token);
      }
      if (auth.authenticated) {
        initProgressStorage(resolve);
      } else {
        resolve(_lsProvider);
      }
    } else {
      resolve(_lsProvider);
    }

    return defer.promise;

    function resolve(provider) {
      defer.resolve(provider);
    }
  }

  function initProgressStorage(callback) {
    auth
      .identify()
      .then(function(user) {
        userContext.user.email = user.email;
        if (!accessLimiter.userHasAccess({ email: user.email })) {
          auth.signout();
          callback(_lsProvider);
          return false;
        }
        userContext.user.email = user.email;
        userContext.user.username = user.name;
        userContext.user.keepMeLoggedIn = !auth.shortTermAccess;
        return _psProvider.getProgressFromServer().then(function(progress) {
          var lsprogress = _lsProvider.getProgress();
          if (
            lsprogress &&
            lsprogress.user &&
            user.email === lsprogress.user.email
          ) {
            lsprogress.user.username = userContext.user.username;
            if (progress == null) {
              _psProvider.setProgress(lsprogress);
              _psProvider.saveProgress(lsprogress);
            }
            _lsProvider.removeProgress();
          }
          callback(_psProvider);
        });
      })
      .fail(function(failed) {
        if (failed.status === 404) {
          _psProvider.startNewAttempt().then(function(newProgress) {
            callback(_psProvider);
          });
        } else {
          callback(_lsProvider);
        }
      });
  }

  function clearLocalStorage() {
    _lsProvider.removeProgress();
  }
});
