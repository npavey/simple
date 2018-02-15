define(function () {

    ko.bindingHandlers.keyDown = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            var bindingData = valueAccessor();
            var keyDownEventHandler = function (event) {
                if(bindingData.hasOwnProperty(event.keyCode)){
                    if (_.isFunction(bindingData[event.keyCode].handler)) {
                        bindingData[event.keyCode].handler(viewModel);
                    }

                    if(!bindingData[event.keyCode].hasOwnProperty('preventDefault') || bindingData[event.keyCode].preventDefault) {
                        event.preventDefault();
                    }

                    if(!bindingData[event.keyCode].hasOwnProperty('stopPropagation') || bindingData[event.keyCode].stopPropagation) {                        
                        event.stopPropagation();
                    }                    
                }
            };

            $(element).on('keydown', keyDownEventHandler);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).off('keydown', keyDownEventHandler);
            });
        }
    };
});