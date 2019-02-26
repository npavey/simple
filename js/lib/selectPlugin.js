﻿(function ($) {
    'use strict';

    var cssClasses = {
        container: 'select-container',
        wrapper: 'select-wrapper',
        value: 'value',
        active: 'active',
        current: 'current',
        default: 'default'
    };

    var Select = function (element, opt) {
        this.element = element;
        this.options = $.extend({}, opt);
        this.isEnabled = true;

        this.init();
    };

    var activeItemIndex = 0;

    Select.prototype = {
        init: function () {
            var that = this,
                $element = $(that.element),
                options = [];
            $.each($element[0].options, function (index, item) {
                options.push(item);
            });
            $element.wrap('<div tabindex="0" class="' + cssClasses.wrapper + '"></div>');
            var $selectWrapper = $element.parent('.' + cssClasses.wrapper);
            var $valueWrapper = $('<div class="' + cssClasses.value + '"></div>')
                .appendTo($selectWrapper);

            $valueWrapper
                .text(that.options.defaultText)
                .attr('title', that.options.defaultText)
                .addClass(cssClasses.default);

            $selectWrapper.on('click', function () {
                if (that.isEnabled) {
                    that.show($selectWrapper, options, function (newValue) {
                        $element.val(newValue).trigger('change');
                        $($valueWrapper)
                            .text(newValue)
                            .attr('title', newValue)
                            .removeClass(cssClasses.default);
                        $selectWrapper.focus();
                    });
                }
            });

            $selectWrapper.on('keydown', function (event) {
                var key = event.which;
                if (key === 13 || key === 40) {
                    event.preventDefault();
                    $selectWrapper.click();
                }
                event.stopPropagation();
            });
        },
        show: function ($element, options, callback) {
            var $html = $('html');
            if ($element.hasClass(cssClasses.active)) {
                return;
            }
            $element.addClass(cssClasses.active);

            var container = $('<div />')
                .addClass(cssClasses.container)
                .css({
                    position: 'absolute',
                    left: ($element.offset().left - 5) + 'px',
                    top: ($element.offset().top + $element.outerHeight()) + 'px',
                    width: ($element.outerWidth() + 45) + 'px'
                })
                .append($('<ul tabindex="-1" role="listbox" />')
                    .on('click', 'li', function () {
                        var text = $(this).text();
                        activeItemIndex = $(this).attr("aria-posinset");
                        $element.find('.' + cssClasses.current)
                            .text(text)
                            .removeClass(cssClasses.default);
                        $element.find('.' + cssClasses.default)
                            .removeClass(cssClasses.default);
                        if (callback) {
                            callback(text);
                        }
                    })
                    .on('keydown', 'li', function (event) {
                        var key = event.which;
                        event.preventDefault();

                        if (key === 13) {
                            $(this).click();
                        }

                        if (key === 27) {
                            handler();
                        }

                        if ((key === 9 && !event.shiftKey) || key === 40) {
                            if (this.parentElement.lastElementChild !== this) {
                                 this.nextSibling.focus();
                            } else {
                                // In case we gonna need to cycle control
                                // this.parentElement.firstElementChild.focus();
                            }
                        }

                        if ((key === 9 && event.shiftKey) || key === 38) {
                            if (this.parentElement.firstElementChild !== this) {
                                 this.previousSibling.focus();
                            } else {
                                // this.parentElement.lastElementChild.focus();
                            }
                        }
                    })
                    .append(getOptionsMarkup()))
                    .appendTo('body');
            if(activeItemIndex){
                container.find('ul li')[activeItemIndex - 1].focus()
            }
            var handler = function () {
                container.remove();
                $element.removeClass(cssClasses.active);
                $html.off('click', handler);
                $(window).off('resize', handler);
            };

            setTimeout(function () {
                $html.on('click', handler);
                $(window).on('resize', handler);
            }, 0);

            function getOptionsMarkup() {
                var optionsMarkup = [];
                for (var i = 0; i < options.length; i++) {
                    if (options[i].value !== $element.find('.' + cssClasses.current).text()) {
                        optionsMarkup.push($('<li tabindex="0" role="option" aria-posinset="' +  (i + 1) + '" aria-setsize="' + options.length + '"/>').text(options[i].value));
                    }
                }
                return optionsMarkup;
            }
        },
        refresh: function () {
            var $element = $(this.element);
            $element.val(this.options.defaultText);
			$('.' + cssClasses.value, $element.parent('.' + cssClasses.wrapper))
                .text(this.options.defaultText)
                .attr('title', this.options.defaultText)
                .addClass(cssClasses.default);
        },
        updateValue: function (selectedText) {
            if (typeof selectedText === 'string') {
                var $element = $(this.element);
                $element.val(selectedText);
                $('.' + cssClasses.value, $element.parent('.' + cssClasses.wrapper))
                    .text(selectedText)
                    .attr('title', selectedText)
                    .removeClass(cssClasses.default);
            }
        },
        enabled: function (isEnabled) {
            this.isEnabled = isEnabled;

            var $selectWrapper = $(this.element).parent('.' + cssClasses.wrapper);
            if (isEnabled) {
                $selectWrapper
                    .attr('tabindex', '0')
                    .addClass('enabled');
            } else {
                $selectWrapper
                    .attr('tabindex', '-1')
                    .removeClass('enabled');
            }
        }
    };

    $.fn.select = function (options, args) {
        return this.each(function () {
            var $element = $(this),
                instance = $element.data('Select');

            if (!instance) {
                $element.data('Select', new Select(this, options));
            } else {
                if (typeof options === 'string') {
                    instance[options].call(instance, args);
                }
            }
        });
    };

})(jQuery);