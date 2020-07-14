define([
  "plugins/router",
  "context",
  "./header/index",
  "./socialNetworks/index",
  "./helpers/validatedValue",
  "xApi/constants",
  "userContext",
  "templateSettings",
  "modules/progress/progressStorage/urlProvider",
  "modules/progress/progressStorage/auth",
  "./limitAccess/accessLimiter",
  "xApi/xApiInitializer",
  "./routing/guardRoute",
  "modules/progress/index",
  "progressContext"
], function(
  router,
  context,
  Header,
  SocialNetworks,
  validatedValue,
  constants,
  userContext,
  templateSettings,
  urlProvider,
  auth,
  accessLimiter,
  xApiInitializer,
  guardRoute,
  progressProvider,
  progressContext
) {
  "use strict";

  var _private = {
    crossDeviceEnabled: templateSettings.allowCrossDeviceSaving,
    isActivatedPreviously: false
  };

  var viewmodel = {
    activate: activate,
    submit: checkUser,
    skip: skip,
    header: null,
    socialNetworks: null,
    email: userContext.user.email || "",
    socialLoginEnabled: false,
    skipAllowed: false,
    canActivate: canActivate,
    requestProcessing: ko.observable(false)
  };

  viewmodel.socialLoginEnabled =
    templateSettings.allowCrossDeviceSaving &&
    templateSettings.allowLoginViaSocialMedia;
  viewmodel.skipAllowed = !templateSettings.xApi.required;

  viewmodel.email = validatedValue(function(value) {
    return !!value() && constants.patterns.email.test(value());
  });

  return viewmodel;

  function canActivate() {
    var defer = Q.defer();
    if (userContext.user.email && !_private.isActivatedPreviously) {
      _private.isActivatedPreviously = true;
      viewmodel.email(userContext.user.email);
      submit(true, function(canActivate) {
        defer.resolve(canActivate);
      });
    } else {
      _private.isActivatedPreviously = true;
      defer.resolve(true);
    }
    return defer.promise;
  }

  function activate() {
    viewmodel.requestProcessing(false);
    viewmodel.header = new Header(context.course.title);
    viewmodel.socialNetworks = viewmodel.socialLoginEnabled
      ? new SocialNetworks(context.course.title, urlProvider.authServiceUrl)
      : null;
  }

  function checkUser() {
    submit(false);
  }

  function submit(replaceWindow, callback) {
    if (viewmodel.requestProcessing()) {
      return;
    }
    callback = callback || function() {};
    if (!viewmodel.email.isValid()) {
      viewmodel.email.markAsModified();
      callback(true);
      return;
    }
    userContext.user.email = viewmodel.email();
    if (!accessLimiter.userHasAccess({ email: viewmodel.email() })) {
      _navigate("noaccess", replaceWindow);
      callback(false);
      return;
    }
    if (_private.crossDeviceEnabled) {
      return userExists(replaceWindow, callback);
    } else {
      _navigate("register", replaceWindow);
      callback(false);
    }
  }

  function skip() {
    if (viewmodel.requestProcessing()) {
      return;
    }

    xApiInitializer.deactivate();
    guardRoute.skipLoginGuard();
    if (!accessLimiter.userHasAccess({ email: viewmodel.email() })) {
      router.navigate("noaccess");
      return;
    }
    templateSettings.allowCrossDeviceSaving = false;
    progressProvider.initialize().then(function(provider) {
      progressContext.use(provider);
      progressContext.restoreProgress();
    });
  }

  function userExists(replaceWindow, callback) {
    viewmodel.requestProcessing(true);
    return auth
      .exists(viewmodel.email())
      .then(function(exists) {
        callback(false);
        viewmodel.requestProcessing(false);
        if (!exists) {
          _navigate("register", replaceWindow);
        } else {
          _navigate("signin", replaceWindow);
        }
      })
      .fail(function(reason) {
        callback(false);
        viewmodel.requestProcessing(false);
        if (reason.status === 409 || reason.status === 401) {
          _navigate("signin", replaceWindow);
        }
      });
  }

  function _navigate(route, replaceWindow) {
    if (replaceWindow) {
      window.location.hash = "#" + route;
      return;
    }
    router.navigate(route);
  }
});
