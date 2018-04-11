define(function () {

    ko.bindingHandlers.toggleVisible = {
        update: function (element, valueAccessor) {
            var $element = $(element),
                isExpanded = valueAccessor().isExpanded,
                animationContainer = $element.find('[data-animate]')[0],
                $animationContainer = $(animationContainer);
                speed = 300;
            if (isExpanded) {
                $animationContainer.slideDown(speed);
            } else {
                $animationContainer.slideUp(speed);
            }
        }
    }
});