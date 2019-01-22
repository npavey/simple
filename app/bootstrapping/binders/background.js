define(['templateSettings', 'displaySettings'], function (templateSettings, displaySettings) {
    'use strict';

    ko.bindingHandlers.secondaryBackground = {
        init: function (element) {
            var body = templateSettings && templateSettings.background && templateSettings.background.body;

            if (body) {
                if (body.texture && body.texture.length) {
                    applyImage(element, body.texture, "repeat");
                }

                if (body.color && body.color.length) {
                    applyColor(element, body.color);
                }

                if (body.brightness) {
                    applyBrightness($('<div />').width('100%').height('100%').appendTo(element), body.brightness);
                }
            }
        }
    };

    return {
        apply: applyOnce()
    };

    function applyOnce() {
        var executed = false;

        return function () {
            if (!executed) {
                executed = true;
                apply(templateSettings.background);
            }
        }
    }

    function apply(background) {

        var elementsClasses = {
            body: {
                element: "body",
                brightness: ".body-layout-wrapper"
            }
        };

        if (background.body.texture && background.body.texture.length) {
            applyImage(elementsClasses.body.element, background.body.texture);
        };

        if (background.body.color && background.body.color.length) {
            applyColor(elementsClasses.body.element, background.body.color);
        };

        if (background.body.brightness) {
            applyBrightness(elementsClasses.body.brightness, background.body.brightness);
        };
    }

    function applyBrightness(element, brightness) {
        var $element = $(element);

        if (brightness === 0) {
            return;
        }

        $element.css({
            "background-color": brightness > 0 ? 'white' : 'black',
            "opacity": brightness > 0 ? brightness : -brightness
        });
    }

    function applyImage(element, url, type) {
        type = type || "repeat";

        var $element = $(element),
            image = new Image(),
            position = displaySettings.backgroundSettings[type].position || '0 0',
            repeat = displaySettings.backgroundSettings[type].repeat || 'no-repeat',
            size = displaySettings.backgroundSettings[type].size || 'auto';

        image.onload = function () {
            $element.css({
                'top': '0',
                'bottom': '0',
                'background-image': 'url(' + url + ')',
                'background-position': position,
                '-webkit-background-size': size,
                'background-size': size,
                'background-repeat': repeat
            })
        };
        image.src = url;
    }

    function applyColor(element, color) {
        $(element).css({
            'background-color': color
        });
    }

});