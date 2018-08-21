    define(['knockout', 'localizationManager', 'underscore', 'repositories/courseRepository'],
    function(ko, localizationManager, _, courseRepository) {
        var course = courseRepository.get();

        var viewModel = {
            next: {},
            resend: {},
            retryCount: 0,
            resultsSendErrorTitleText: '',
            endpointNameText: '',

            isCompositionComplete: ko.observable(false),
            isResendingResults: ko.observable(false),
            resendingFailed: ko.observable(false),
            retriesExceeded: ko.observable(false),

            activate: activate,
            compositionComplete: compositionComplete,
            resendResults: resendResults,
            skipResultsSending: skipResultsSending,
            hideDialog: hideDialog
        };
       
        return viewModel;

        function activate(data) {
            throwIfNotDefined(data.callbacks, 'callbacks');
            throwIfNotDefined(data.callbacks.resend, 'callbacks.resend');
            throwIfNotDefined(data.callbacks.next, 'callbacks.next');
            throwIfNotDefined(data.close, 'close');

            throwIfNotDefined(data.resultsSendErrorTitleKey, 'resultsSendErrorTitleKey');
            throwIfNotDefined(data.endpointNameKey, 'endpointNameKey');

            viewModel.resultsSendErrorTitleText = localizeText(data.resultsSendErrorTitleKey);
            viewModel.endpointNameText = localizeText(data.endpointNameKey);

            viewModel.resend = data.callbacks.resend;
            viewModel.next = data.callbacks.next;
            viewModel.close = data.close;

            viewModel.retryCount = data.retryCount || 10;

        }

        function compositionComplete() {
            viewModel.isCompositionComplete(true);
        }
        
        function resendResults() {
            viewModel.isResendingResults(true);

            viewModel.resend(course)
                .then(function() {
                    hideDialog();
                    viewModel.next();
                })
                .catch(function() {
                    viewModel.retryCount ? viewModel.retryCount-- : viewModel.retriesExceeded(true);
                    
                    viewModel.isResendingResults(false);
                    animateNates();
                });
        }

        function skipResultsSending() {
            hideDialog();
            viewModel.next();
        }

        function hideDialog() {
            viewModel.isResendingResults(false);
            viewModel.close();
        }

        function localizeText(key) {
            return localizationManager.getLocalizedText(key);
        }

        function throwIfNotDefined(parameter, parameterName) {
            if(_.isNullOrUndefined(parameter)) {
                throw 'Can\'t activate dialog. Parameter isn\'t defined. Parameter name: ' + parameterName;
            }
        }

        function animateNates() {
            viewModel.resendingFailed(true);
            setTimeout(function() {
                viewModel.resendingFailed(false);
            }, 400);
        }
    });