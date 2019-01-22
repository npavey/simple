define(['plugins/router', 'constants', 'repositories/questionRepository', 'repositories/sectionRepository', 'templateSettings', 'modules/questionsNavigation'],
    function(router, constants, questionRepository, sectionRepository, templateSettings, navigationModule) {
        "use strict";

        var viewModel = {
            section: null,
            question: null,

            startTime: null,

            masteryScore: 0,

            navigationContext: null,
            backToSections: backToSections,
            isNextQuestionAvailable: isNextQuestionAvailable,
            nextQuestionUrl: nextQuestionUrl,
            goNext: goNext,
            isPreviousQuestionAvailable: isPreviousQuestionAvailable,
            previousQuestionUrl: previousQuestionUrl,
            goPrevious: goPrevious,

            voiceOver: null,

            activeViewModel: null,

            activate: activate,
            isNavigationLocked: router.isNavigationLocked,
            deactivate: deactivate
        };

        return viewModel;

        function backToSections() {
            if (router.isNavigationLocked()) {
                return;
            }
            router.navigate('sections');
        }

        function isNextQuestionAvailable() {
            return !_.isNullOrUndefined(viewModel.navigationContext.nextQuestionUrl) && !router.isNavigationLocked();
        }

        function nextQuestionUrl() {
            return router.isNavigationLocked() ? undefined : viewModel.navigationContext.nextQuestionUrl;
        }

        function goNext() {
            if (router.isNavigationLocked() || !isNextQuestionAvailable()) {
                return;
            }
            router.navigate(viewModel.navigationContext.nextQuestionUrl);
        }

        function isPreviousQuestionAvailable() {
            return !_.isNullOrUndefined(viewModel.navigationContext.previousQuestionUrl) && !router.isNavigationLocked();
        }

        function previousQuestionUrl() {
            return router.isNavigationLocked() ? undefined : viewModel.navigationContext.previousQuestionUrl;
        }

        function goPrevious() {
            if (router.isNavigationLocked() || !isPreviousQuestionAvailable()) {
                return;
            }
            router.navigate(viewModel.navigationContext.previousQuestionUrl);
        }

        function getActiveContentViewModel(question) {
            switch (question.type) {
                case constants.questionTypes.informationContent:
                    return 'viewmodels/questions/informationContent';
                default:
                    return 'viewmodels/questions/questionContent';
            }
        }

        function activate(sectionId, questionId) {

            return Q.fcall(function() {
                viewModel.section = sectionRepository.get(sectionId);
                if (viewModel.section === null) {
                    router.navigate('404', { replace: true, trigger: true });
                    return;
                }

                viewModel.masteryScore = templateSettings.masteryScore.score;
                viewModel.isSectionMastered = ko.computed(function() {
                    return viewModel.section.score() >= templateSettings.masteryScore.score;
                });

                viewModel.question = questionRepository.get(sectionId, questionId);
                if (viewModel.question === null) {
                    router.navigate('404', { replace: true, trigger: true });
                    return;
                }


                viewModel.voiceOver = viewModel.question.voiceOver;

                viewModel.startTime = new Date();
                viewModel.navigationContext = navigationModule.getNavigationContext(viewModel.section.id, viewModel.question.id);


                return viewModel.question.load().then(function() {
                    router.activeInstruction().config.title = TranslationPlugin.getTextByKey(
                        viewModel.question.isInformationContent 
                        ? '[content page title]' 
                        : '[question page title]'
                    );

                    viewModel.activeViewModel = getActiveContentViewModel(viewModel.question);
                });
            });
        }

        function deactivate() {
            if (viewModel.question && viewModel.question.learningContents.length > 0) {
                viewModel.question.learningContentExperienced(new Date() - viewModel.startTime);
            }
        }
    }
);