define(['underscore', 'header/header'], function(_, header) {
    ko.bindingHandlers.headerHeightDepender = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var deactivate = viewModel.deactivate;

            viewModel.deactivate = function() {
                if(_.isFunction(deactivate)) {
                    deactivate();
                }

                header.height(null);
            }
        },
        update: function (element) {
            setTimeout(function(){
                var innerHeight = $(element).actual('innerHeight');
    
                header.height(innerHeight);
            }, 0)
        }
    }
});