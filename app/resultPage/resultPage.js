define([
    'repositories/courseRepository', 'templateSettings', 'plugins/router', 'progressContext',
    'userContext', 'xApi/xApiInitializer', 'helpers/appOperations', 'constants', 'modules/progress/progressStorage/auth',
    'modules/publishModeProvider', 'dialogs/dialog', 'modules/progress/progressStorage/certificateProvider',
    'helpers/fileDownloader', 'localizationManager', 'modules/webhooks'
], function(courseRepository, templateSettings, router, progressContext, userContext,
    xApiInitializer, appOperations, constants, auth, publishModeProvider, 
    Dialog, certificateProvider, fileDownloader, localizationManager, webhooks) {
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
        resendResultsDialog: new Dialog(),

        //properties
        isInReviewAttemptMode: false,
        isCompleted: false,
        crossDeviceEnabled: false,
        allowContentPagesScoring: false,
        xAPIEnabled: false,
        scormEnabled: false,
        canDownloadCertificate: false,
        certificateDownloaded: false,
        stayLoggedIn: ko.observable(false),

        //methods
        toggleStayLoggedIn: toggleStayLoggedIn
    };

    return viewModel;

    function activate() {
        viewModel.isInReviewAttemptMode = course.isFinished;
        viewModel.npsDialog.isVisible(false);
        viewModel.newAttemptDialog.isVisible(false);
        viewModel.resendResultsDialog.isVisible(false);
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

        if(viewModel.canDownloadCertificate && !viewModel.certificateDownloaded){
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

        if(course.getStatus() === constants.course.statuses.inProgress) {
            var finishHandler = (viewModel.crossDeviceEnabled || viewModel.scormEnabled) ?
                progressContext.finish : progressContext.remove;
                
            course.setFinishedStatus();
            return finishHandler(function() {
                progressContext.status(progressStatuses.ignored);
                course.finish(sendWebhooks);
            });
        }

        sendWebhooks();
    }

    function downloadCertificate() {
        viewModel.isDownloadingCertificate(true);
        return certificateProvider.getCertificateUrl(course.id, course.templateId, course.title, course.score, templateSettings.logo.url)
            .then(function(url){
                /* Fix for IE11 and Edge (files can`t saved without extension) */
                var filename = localizationManager.getLocalizedText('[certificate file name]') + '.pdf';
                return fileDownloader.downloadFile(url, filename);
            })
            .always(function(){
                viewModel.isDownloadingCertificate(false);
                viewModel.certificateDownloaded = true;
            });
    }

    function sendWebhooks() {
        if (webhooks.initialized) {
            return webhooks.sendResults(course)
                .then(function() {
                    onCourseFinished();
                })
                .catch(function() {
                    viewModel.status(statuses.readyToFinish);
                    viewModel.resendResultsDialog.resultsSendErrorTitleKey = constants.dialogs.resendResults.webhooks.resultsSendErrorTitleKey;
                    viewModel.resendResultsDialog.endpointNameKey = constants.dialogs.resendResults.webhooks.endpointNameKey;
                    viewModel.resendResultsDialog.show({
                        resend: webhooks.sendResults.bind(webhooks),
                        next: onCourseFinished, 
                    });
                });
        } 

        onCourseFinished();
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

        if (templateSettings.nps.enabled && xApiInitializer.isNpsReportingInitialized) {
            return viewModel.npsDialog.show({
                closed: function() {
                   finalize({close: true});
                },
                finalized: function() {
                   finalize({close: false});
                }
            });
        }

        finalize({close: true});
    }

    function finalize(params) {
        params = params || {};
        if (auth.authenticated && !viewModel.stayLoggedIn())
            auth.signout();

        course.finalize(function() {
            if (params.close){
                appOperations.close({ 
                    shouldCloseWindow: !viewModel.canDownloadCertificate 
                });
            }
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