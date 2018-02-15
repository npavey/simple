define(['modules/questionsNavigation', 'plugins/router', 'templateSettings', 'context'], function (navigationModule, router, templateSettings, context) {
    "use strict";

    var viewModel = {
        title: null,
        learningContents: null,
        navigateNext: navigateNext,
        goToNextSection: goToNextSection,
        goToResults: goToResults,
        copyright: templateSettings.copyright,

        activate: activate,
        isGoToNextSectionVisible: ko.observable(false),
        isGoToResultsVisible: ko.observable(false),
        isNavigationLocked: router.isNavigationLocked
    };

    return viewModel;

    function navigateNext() {
        if (router.isNavigationLocked()) {
            return;
        }

        var nextUrl = !_.isNullOrUndefined(viewModel.navigationContext.nextQuestionUrl) ? viewModel.navigationContext.nextQuestionUrl : 'sections';
        router.navigate(nextUrl);
    }

    function goToNextSection() {
        if (router.isNavigationLocked()) {
            return;
        }
        if (!viewModel.navigationContext.nextSectionUrl) {
            return;
        }

        router.navigate(viewModel.navigationContext.nextSectionUrl);
    }

    function goToResults() {
        if (router.isNavigationLocked()) {
            return;
        }
        router.navigate('#finish');
    }

    function activate(sectionId, question) {
        return Q.fcall(function () {
            question.submitAnswer();

            viewModel.navigationContext = navigationModule.getNavigationContext(sectionId, question.id);
            viewModel.id = question.id;
            viewModel.title = question.title;
            viewModel.learningContents = question.learningContents;


            if ((context.course.score() === 100 && !context.isInReviewAttemptMode()) || (!viewModel.navigationContext.nextSectionUrl && viewModel.navigationContext.questionsCount === viewModel.navigationContext.currentQuestionIndex)) {
                viewModel.isGoToResultsVisible(true);
                viewModel.isGoToNextSectionVisible(false);
            } else if (viewModel.navigationContext.questionsCount === viewModel.navigationContext.currentQuestionIndex){
                viewModel.isGoToResultsVisible(false);
                viewModel.isGoToNextSectionVisible(true);
            } else {
                viewModel.isGoToResultsVisible(false);
                viewModel.isGoToNextSectionVisible(false);
            }  
        });
    }
});