define([
    'durandal/app', 'windowOperations', 'repositories/courseRepository', 'progressContext',
    'plugins/router', 'templateSettings', 'constants',
    'xApi/xApiInitializer', 'includedModules/modulesInitializer', 'context', 'modules/publishModeProvider','dialogs/dialog'
], function(app, windowOperations, courseRepository, progressContext, router, templateSettings,
    constants, xApiInitializer, modulesInitializer, context, publishModeProvider, Dialog) {
    "use strict";

    var progressStatuses = constants.progressContext.statuses;
    var course = courseRepository.get();

    var statuses = {
        readyToFinish: 'readyToFinish',
        sendingRequests: 'sendingRequests',
        finished: 'finished'
    };

    var viewModel = {
        type: ko.observable(),
        isNavigationLocked: router.isNavigationLocked,

        status: ko.observable(statuses.readyToFinish),
        statuses: statuses,

        score: null,
        isCompleted: false,
        isInReviewAttemptMode: false,
        xAPIEnabled: false,
        scormEnabled: false,
        hideFinishActionButtons: false,
        activate: activate
    };

    viewModel.continueLaterPopup = new Dialog();

    viewModel.continueLaterPopup.actions = {
        close: viewModel.continueLaterPopup.hide,
        exit: exit
    };

    viewModel.isProgressSaved = ko.computed(function() {
        return progressContext.status() === progressStatuses.saved;
    });

    viewModel.isProgressNotSaved = ko.computed(function() {
        return progressContext.status() === progressStatuses.error;
    });

    viewModel.finishAction = function() {
        router.navigate('#finish');
    };

    viewModel.takeABreakAction = function() {
        viewModel.continueLaterPopup.show();
    }

    return viewModel;

    function activate(type) {
        viewModel.score = context.course.score;
        viewModel.isCompleted = context.course.isCompleted();
        viewModel.isInReviewAttemptMode = context.isInReviewAttemptMode();
        viewModel.type(type);
        viewModel.xAPIEnabled = xApiInitializer.isLrsReportingInitialized;
        viewModel.scormEnabled = publishModeProvider.isScormEnabled;
        viewModel.hideFinishActionButtons = templateSettings.hideFinishActionButtons;
    }

    function exit() {
        if (progressContext.status() === progressStatuses.error) {
            var isCourseClosingConfirmed = confirm(TranslationPlugin.getTextByKey('[progress is not saved confirmation]'));
            if (!isCourseClosingConfirmed) {
                return;
            }
            progressContext.status(progressStatuses.ignored);
        }

        course.finalize(function() {
            windowOperations.close();
        });
    }

});