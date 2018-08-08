define(['knockout', 'underscore', 'repositories/courseRepository', 'templateSettings', 'browserSupport'],
    function(ko, _, courseRepository, templateSettings, browserSupport) {
        var steps = {
            evaluation: 'evaluation',
            feedback: 'feedback',
            end: 'end'
        };

        var course = courseRepository.get();

        var viewModel = {
            activate: activate,
            submit: submit,
            goToFeedbackStep: goToFeedbackStep,
            score: ko.observable(0),
            feedback: ko.observable(''),
            isFeedbackEditing: ko.observable(false),
            currentStep: ko.observable(),
            callbacks: {},
            compositionComplete: compositionComplete,
            isCompositionComplete: ko.observable(false),
            evaluationStepTitle: '',
            isCourseEmbedded: window.self !== window.top,
            isReporting: ko.observable(false)
        };

        viewModel.isEvaluationStep = ko.computed(function() {
            return viewModel.currentStep() === steps.evaluation;
        });

        viewModel.isFeedbackStep = ko.computed(function() {
            return viewModel.currentStep() === steps.feedback;
        });

        viewModel.isLastStep = ko.computed(function() {
            return viewModel.currentStep() === steps.end;
        });

        return viewModel;

        function activate(data) {
            if (!data.close)
                throw 'Nps dialog activation data close() method is not specified';

            viewModel.close = data.close;
            if (data.callbacks)
                viewModel.callbacks = data.callbacks;

            viewModel.score(0);
            viewModel.feedback('');
            viewModel.currentStep(steps.evaluation);
            viewModel.isReporting(false);
            viewModel.isFeedbackEditing(false);

            var evaluationStepTitleKey = templateSettings.xApi.enabled ? '[progress has been reported]' : '[you have finished your course]';
            viewModel.evaluationStepTitle = TranslationPlugin.getTextByKey(evaluationStepTitleKey);
        }

        function compositionComplete() {
            viewModel.isCompositionComplete(true);
        }

        function goToFeedbackStep() {
            viewModel.currentStep(steps.feedback);
            if (!browserSupport.isMobileDevice) {
                viewModel.isFeedbackEditing(true);
            }
        }

        function submit() {
            viewModel.isReporting(true);

            course.evaluate({
                score: viewModel.score() / 10,
                response: viewModel.feedback().trim()
            }, function() {
                viewModel.isReporting(false);
                viewModel.currentStep(steps.end);
                if (_.isFunction(viewModel.callbacks.finalized)) {
                    viewModel.callbacks.finalized();
                }
            });
        }
    });