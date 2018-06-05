define([
    'repositories/courseRepository', 'templateSettings', 'plugins/router', 'progressContext',
    'userContext', 'xApi/xApiInitializer', 'includedModules/modulesInitializer',
    'windowOperations', 'constants', 'modules/progress/progressStorage/auth', 'modules/publishModeProvider', 'dialogs/dialog',
    'modules/progress/progressStorage/certificateProvider', 'helpers/fileDownloader', 'localizationManager'
], function(courseRepository, templateSettings, router, progressContext, userContext,
    xApiInitializer, modulesInitializer, windowOperations, constants, auth, publishModeProvider, Dialog, certificateProvider, fileDownloader, localizationManager) {
    "use strict";

    var course = courseRepository.get();

    var progressStatuses = constants.progressContext.statuses;

    var statuses = {
        readyToFinish: 'readyToFinish',
        preparingCertificate: 'preparingCertificate',
        sendingRequests: 'sendingRequests',
        finished: 'finished'
    };

    var viewModel = {
        score: course.score,
        title: course.title,
        sections: [],
        status: ko.observable(statuses.readyToFinish),
        statuses: statuses,
        activate: activate,
        close: close,
        finish: finish,
        isDownloadingCertificate: ko.observable(false),
        downloadCertificate: downloadCertificate,
        npsDialog: new Dialog(),
        newAttemptDialog: new Dialog(),
        isInReviewAttemptMode: course.isFinished,

        //properties
        isCompleted: false,
        crossDeviceEnabled: false,
        allowContentPagesScoring: false,
        xAPIEnabled: false,
        scormEnabled: false,
        canDownloadCertificate: false,
        stayLoggedIn: ko.observable(false),

        //methods
        toggleStayLoggedIn: toggleStayLoggedIn
    };

    return viewModel;

    function activate() {
        viewModel.npsDialog.isVisible(false);
        viewModel.newAttemptDialog.isVisible(false);
        viewModel.crossDeviceEnabled = templateSettings.allowCrossDeviceSaving;
        viewModel.canDownloadCertificate =  templateSettings.allowCrossDeviceSaving 
                                                && templateSettings.allowCertificateDownload 
                                                && course.isCompleted();
        
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

        viewModel.isCompleted = course.isCompleted();
    }
    
    function close() {
        router.navigate("#sections");
    }

    function finish() {
        if (router.isNavigationLocked() || viewModel.status() !== statuses.readyToFinish) {
            return;
        }

        if(viewModel.canDownloadCertificate){
            viewModel.status(statuses.preparingCertificate);
            downloadCertificate().always(doFinishCourse);
            return;
        }

        doFinishCourse();
    }

    function doFinishCourse(){
        if (templateSettings.xApi.enabled && xApiInitializer.isLrsReportingInitialized) {
            viewModel.status(statuses.sendingRequests);
        }

        var finishHandler = (viewModel.crossDeviceEnabled || viewModel.scormEnabled) ?
            progressContext.finish : progressContext.remove;
            
        course.setFinishedStatus();
        finishHandler(function() {
            course.finish(onCourseFinished);
        });
    }

    function downloadCertificate() {
        viewModel.isDownloadingCertificate(true);
        return certificateProvider.getCertificateUrl(course.id, course.templateId, course.title, course.score)
            .then(function(url){
                /* Fix for IE11 and Edge (files can`t saved without extension) */
                var filename = localizationManager.getLocalizedText('[certificate file name]') + '.pdf';
                return fileDownloader.downloadFile(url, filename);
            })
            .always(function(){
                viewModel.isDownloadingCertificate(false);
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