define(['templateSettings'], function (templateSettings) {
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
            header: {
                element: ".header",
                brightness: ".header-overlay"
            },
            fullscreenHeader: {
                element: ".fullscreen-header-overlay",
                brightness: ".fullscreen-header-brightness-holder"
            },
            body: {
                element: "body",
                brightness: ".body-layout-wrapper"
            }
        };

        if (background.body.texture && background.body.texture.length) {
            applyImage(elementsClasses.body.element, background.body.texture, "repeat");
        };

        if (background.body.color && background.body.color.length) {
            applyColor(elementsClasses.body.element, background.body.color);
        };

        if (background.body.brightness) {
            applyBrightness(elementsClasses.body.brightness, background.body.brightness);
        };

        var headerClasses = elementsClasses.header;

        if (!background.body.enabled) {
            headerClasses = elementsClasses.fullscreenHeader;
        }

        if (background.header.image && background.header.image.url && background.header.image.url.length) {
            applyImage(headerClasses.element, background.header.image.url, background.header.image.option);
        };
        if (background.header.color && background.header.color.length) {
            applyColor(headerClasses.element, background.header.color);
        };
        if (background.header.brightness) {
            applyBrightness(headerClasses.brightness, background.header.brightness);
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
        var $element = $(element),
            image = new Image(),
            position = '0 0',
            repeat = 'no-repeat',
            size = 'auto';

        if (type === 'repeat') {
            repeat = 'repeat';
        };

        if (type === 'fullscreen') {
            size = 'cover';
            position = 'center';
        };

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