define([
    'repositories/courseRepository', 'templateSettings', 'plugins/router', 'progressContext',
    'userContext', 'xApi/xApiInitializer', 'includedModules/modulesInitializer',
    'windowOperations', 'constants', 'modules/progress/progressStorage/auth', 'modules/publishModeProvider', 'dialogs/dialog'
], function(courseRepository, templateSettings, router, progressContext, userContext,
    xApiInitializer, modulesInitializer, windowOperations, constants, auth, publishModeProvider, Dialog) {
    "use strict";

    var course = courseRepository.get();

    var progressStatuses = constants.progressContext.statuses;

    var statuses = {
        readyToFinish: 'readyToFinish',
        sendingRequests: 'sendingRequests',
        finished: 'finished'
    };

    var viewModel = {
        score: course.score,
        title: course.title,
        sections: [],
        isCompleted: course.isCompleted(),
        status: ko.observable(statuses.readyToFinish),
        statuses: statuses,
        activate: activate,
        close: close,
        finish: finish,
        npsDialog: new Dialog(),
        newAttemptDialog: new Dialog(),
        isInReviewAttemptMode: course.isFinished,

        //properties
        crossDeviceEnabled: false,
        allowContentPagesScoring: false,
        xAPIEnabled: false,
        scormEnabled: false,
        stayLoggedIn: ko.observable(false),

        //methods
        toggleStayLoggedIn: toggleStayLoggedIn
    };

    return viewModel;

    function activate() {
        viewModel.npsDialog.isVisible(false);
        viewModel.newAttemptDialog.isVisible(false);
        viewModel.crossDeviceEnabled = templateSettings.allowCrossDeviceSaving;
        
        viewModel.allowContentPagesScoring = templateSettings.allowContentPagesScoring;

        viewModel.xAPIEnabled = xApiInitializer.isLrsReportingInitialized;
        viewModel.scormEnabled = publishModeProvider.isScormEnabled;

        viewModel.stayLoggedIn(userContext.user.keepMeLoggedIn);
        viewModel.sections = _.chain(course.sections)
            .filter(function(section) {
                return section.affectProgress || section.hasSurveyQuestions;
            })
            .map(mapSection)
            .value();
    }
    
    function close() {
        router.navigate("#sections");
    }

    function finish() {
        if (router.isNavigationLocked() || viewModel.status() !== statuses.readyToFinish) {
            return;
        }

        if (templateSettings.xApi.enabled && xApiInitializer.isLrsReportingInitialized) {
            viewModel.status(statuses.sendingRequests);
        }

        var finishHandler = (viewModel.crossDeviceEnabled || viewModel.scormEnabled) ?
            progressContext.finish : progressContext.remove;

        finishHandler(function() {
            course.finish(onCourseFinished);
        });
    }

    function onCourseFinished() {
        viewModel.status(statuses.finished);
        progressContext.status(progressStatuses.ignored);

        if (templateSettings.nps.enabled && xApiInitializer.isNpsReportingInitialized) {
            viewModel.npsDialog.show({
                closed: function() {
                   finalize({close: true});
                },
                finalized: function() {
                   finalize({close: false});
                }
            });

            return;
        }

        finalize({close: true});
    }

    function finalize(params) {
        params = params || {};
        if (auth.authenticated && !viewModel.stayLoggedIn())
            auth.signout();

        course.finalize(function() {
            if (params.close)
                windowOperations.close();
        });
    }

    function toggleStayLoggedIn() {
        viewModel.stayLoggedIn(userContext.user.keepMeLoggedIn = !viewModel.stayLoggedIn());
        auth.shortTermAccess = !userContext.user.keepMeLoggedIn;
    }

    function mapSection(entity) {
        var section = {};

        section.id = entity.id;
        section.title = entity.title;
        section.score = entity.score();

        section.readedContents = _.filter(entity.questions, function(question) {
                return !isQuestion(question) && question.isAnswered;
            })
            .length;

        section.questions = _.filter(entity.questions, function(question) {
            return isQuestion(question);
        });

        section.amountOfQuestions = _.filter(section.questions, function(question) {
                return !question.isSurvey;
            })
            .length;

        section.correctQuestions = _.filter(section.questions, function(question) {
                return question.isAnswered && question.isCorrectAnswered && !question.isSurvey;
            })
            .length;

        section.amountOfContents = entity.questions.length - section.questions.length;
        section.affectProgress = entity.affectProgress;
        section.title = entity.title;

        section.isCorrect = entity.isCompleted();

        return section;
    }

    function isQuestion(question) {
        return question.type !== constants.questionTypes.informationContent;
    }
});