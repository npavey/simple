define(['knockout', 'plugins/router', 'constants', 'modules/questionsNavigation', 'viewmodels/questions/questionsViewModelFactory', 'templateSettings', 'localizationManager', 'context'],
    function (ko, router, constants, navigationModule, questionViewModelFactory, templateSettings, localizationManager, context) {
        "use strict";

        function QuestionContent() {
            var self = this;
            
            this.sectionId = null;
            this.question = null;
            
            this.title = '';
            this.index = 0;
            this.isAnswered = ko.observable(false);
            this.isCorrect = ko.observable(false);
            this.isExpanded = ko.observable(true);
            this.isPreview = false;
            this.isSurvey = false;
            this.copyright = templateSettings.copyright;

            this.learningContents = [];
            this.questionInstructions = [];
            this.correctFeedback = ko.observable(null);
            this.incorrectFeedback = ko.observable(null);
            this.feedbackResultText = ko.observable('');
            this.feedbackView = '';
            this.submitViewModel = '';

            this.navigationContext = null;

            this.activeQuestionViewModel = null;
            
            this.isNavigationLocked = router.isNavigationLocked;

            this.isCorrectAnswered = ko.computed(function() {
                return self.isAnswered() && self.isCorrect();
            });

            this.isWrongAnswered = ko.computed(function () {
                return self.isAnswered() && !self.isCorrect();
            });

            // this logic moved here from html view to fix blinking bug in IE11
            this.updateFeedbackResultText = function() {
                var key = '[your answer was stored]';
                if (!self.isSurvey) {
                    key = self.isCorrect() ? '[correct answer]': '[incorrect answer]';
                }

                this.feedbackResultText(localizationManager.getLocalizedText(key));
            }

            this.hideTryAgain = false;

            this.isGoToNextSectionVisible = ko.observable(false);
            this.isGoToResultsVisible = ko.observable(false);
        };

        QuestionContent.prototype.submit = function() {
            var self = this;
            
            return self.activeQuestionViewModel.submit().then(function () {
                self.isCorrect(self.question.isCorrectAnswered);
                self.updateFeedbackResultText();
                self.isAnswered(self.question.isAnswered);

                updateNavigationState(self);
            });
        }

        QuestionContent.prototype.tryAnswerAgain = function () {	
            var self = this;

            return self.activeQuestionViewModel.tryAnswerAgain().then(function () {
                self.isAnswered(false);
            });
        }

        QuestionContent.prototype.navigateNext = function () {
            if (router.isNavigationLocked()) {
                return;
            }

            var nextUrl = !_.isNullOrUndefined(this.navigationContext.nextQuestionUrl) ? this.navigationContext.nextQuestionUrl : 'sections';
            router.navigate(nextUrl);
        }

        QuestionContent.prototype.goToNextSection = function () {
            if (router.isNavigationLocked()) {
                return;
            }
            if (!this.navigationContext.nextSectionUrl) {
                return;
            }
    
            router.navigate(this.navigationContext.nextSectionUrl);
        }

        QuestionContent.prototype.goToResults = function () {
            if (router.isNavigationLocked()) {
                return;
            }
    
            router.navigate('#finish');
        }
        
        QuestionContent.prototype.toggleExpand = function () {
            return this.isExpanded(!this.isExpanded());
        }

        QuestionContent.prototype.activate = function (sectionId, question, index, isPreview) {
            if (!sectionId || !question) {
                return;
            }


            this.isGoToResultsVisible(false);
            this.isGoToNextSectionVisible(false);

            this.sectionId = sectionId;
            this.question = question;
            this.isPreview = _.isUndefined(isPreview) ? false : isPreview;
            this.index = _.isUndefined(index) ? 0 : index < 10 ? '0' + index : index;
            this.navigationContext = navigationModule.getNavigationContext(this.sectionId, this.question.id);
            this.title = this.question.title;
            this.isAnswered(this.question.isAnswered);
            this.isCorrect(this.question.isCorrectAnswered);
            this.isSurvey = !!question.isSurvey;

            this.learningContents = this.question.learningContents;
            this.questionInstructions = this.question.questionInstructions;
            this.correctFeedback(this.question.feedback.correct);
            this.incorrectFeedback(this.question.feedback.incorrect);
            this.updateFeedbackResultText();

            this.activeQuestionViewModel = questionViewModelFactory.getViewModel(this.question.type);
            this.feedbackView = this.activeQuestionViewModel.feedbackView || 'questions/feedback.html';
            this.submitViewModel = this.activeQuestionViewModel.customSubmitViewModel || '';

            this.hideTryAgain = templateSettings.hideTryAgain || context.isInReviewAttemptMode();

            updateNavigationState(this);

            if(isPreview){
                var self = this;

                return this.question.load().then(function(){
                    return self.activeQuestionViewModel.initialize(self.question, isPreview);
                });
            } else {
                return this.activeQuestionViewModel.initialize(this.question, isPreview);
            }
        }

        QuestionContent.prototype.deactivate = function () {
            if (_.isFunction(this.activeQuestionViewModel.deactivate)) {
                this.activeQuestionViewModel.deactivate();
            }
        }

        function updateNavigationState(viewModel) {
            if ((context.course.score() === 100 && !context.isInReviewAttemptMode()) || (!viewModel.navigationContext.nextSectionUrl && viewModel.navigationContext.questionsCount === viewModel.navigationContext.currentQuestionIndex)) {
                viewModel.isGoToResultsVisible(true);
                viewModel.isGoToNextSectionVisible(false);
            } else if (viewModel.navigationContext.questionsCount === viewModel.navigationContext.currentQuestionIndex) {
                viewModel.isGoToResultsVisible(false);
                viewModel.isGoToNextSectionVisible(true);
            } else {
                viewModel.isGoToResultsVisible(false);
                viewModel.isGoToNextSectionVisible(false);
            }
        }

        return QuestionContent;
    }
);