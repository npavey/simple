﻿define(['durandal/composition'], function (composition) {

    ko.bindingHandlers.scrollIntoView = {
        update: function (element, valueAccessor) {
            var $element = $(element),
                isVisible = ko.utils.unwrapObservable(valueAccessor());

            if (!isVisible) {
                return;
            }

            scrollToElement($element);
        }
    };

    function scrollToElement($element) {
        _.defer(function () {
            if (!$element.is(':hidden')){
                $('html:not(:animated),body:not(:animated)').animate({
                    scrollTop: $element.offset().top
                }, function () { });
            }
        });
    }

    composition.addBindingHandler('scrollIntoView');

});