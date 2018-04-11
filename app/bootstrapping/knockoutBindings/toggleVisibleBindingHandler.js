define(function () {

    ko.bindingHandlers.toggleVisible = {
        update: function (element, valueAccessor) {
            var $element = $(element),
                isExpanded = valueAccessor().isExpanded,
                $animationContainer = $element.children('[data-animate]'),
                speed = 300;
            if (isExpanded) {
                $animationContainer.slideDown(speed);
            } else {
                $animationContainer.slideUp(speed);
            }
        }
    }
});