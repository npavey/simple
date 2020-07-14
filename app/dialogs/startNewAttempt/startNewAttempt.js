define(['knockout', 'progressContext'],
    function(ko, progressContext) {
        var viewModel = {
            activate: activate,
            callbacks: {},
            compositionComplete: compositionComplete,
            isCompositionComplete: ko.observable(false),
            isStartingNewAttempt: ko.observable(false),
            startNewAttempt: startNewAttempt,
            hide: hide
        };
       
        return viewModel;

        function activate(data) {
            if (!data.close)
                throw 'Start new attempt dialog activation data close() method is not specified';

            viewModel.close = data.close;
            if (data.callbacks)
                viewModel.callbacks = data.callbacks;
        }

        function compositionComplete() {
            viewModel.isCompositionComplete(true);
        }

        function hide() {
            viewModel.isCompositionComplete(false);
            viewModel.close && viewModel.close();
        }
        
        function startNewAttempt() {
            viewModel.isStartingNewAttempt(true);
            progressContext.remove(function() {
                window.location = window.location.href.split("#")[0];
                viewModel.isStartingNewAttempt(false);
            });
        }
    });