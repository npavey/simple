define([
  "modules/progress/progressStorage/auth",
  "context",
  "userContext",
  "templateSettings",
  "includedModules/modulesInitializer",
  "modules/publishModeProvider"
], function(
  auth,
  context,
  userContext,
  templateSettings,
  modulesInitializer,
  publishModeProvider
) {
  var viewModel = {
    activate: activate,
    progressStorageActivated: false,
    email: "",
    sendSecretLink: sendSecretLink,
    isSecretLinkSent: ko.observable(false),
    keepMeLoggedIn: ko.observable(false),
    toggleKeepMeLoggedIn: toggleKeepMeLoggedIn,
    isSecondRemarkShouldBeShown: true
  };

  return viewModel;

  function sendSecretLink() {
    auth.sendSecretLink(context.course.id).then(function() {
      viewModel.isSecretLinkSent(true);
    });
  }

  function toggleKeepMeLoggedIn() {
    viewModel.keepMeLoggedIn(
      (userContext.user.keepMeLoggedIn = !viewModel.keepMeLoggedIn())
    );
    auth.shortTermAccess = !userContext.user.keepMeLoggedIn;
  }

  function activate(data) {
    if (data) {
      viewModel.close = data.close;
      viewModel.exit = function() {
        if (!userContext.user.keepMeLoggedIn) {
          auth.signout().then(function() {
            data.exit();
          });
        } else {
          data.exit();
        }
      };
      viewModel.progressStorageActivated =
        templateSettings.allowCrossDeviceSaving &&
        !publishModeProvider.isScormEnabled;
      viewModel.isSecondRemarkShouldBeShown = !(
        templateSettings.allowCrossDeviceSaving ||
        publishModeProvider.isScormEnabled
      );
      viewModel.email = userContext.user.email;
      viewModel.keepMeLoggedIn(userContext.user.keepMeLoggedIn);
    }
  }
});
