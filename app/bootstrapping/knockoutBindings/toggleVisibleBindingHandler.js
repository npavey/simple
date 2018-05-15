define(function () {

    ko.bindingHandlers.toggleVisible = {
        update: function (element, valueAccessor) {
            var $element = $(element),
                isExpanded = valueAccessor().isExpanded,
                $animationContainer = $element.children('[data-animate]'),
                speed = 300;
            if (isExpanded) {
                $animationContainer.css('height', '').hide().slideDown(speed);
            } else {
                $animationContainer.animate({height: 0}, speed);
            }
        }
    }
});