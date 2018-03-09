define([
    'knockout', 'underscore', 'plugins/router', 'context', 'templateSettings', 'constants'
], function (ko, _, router, context, templateSettings, constants) {

        'use strict';
        var viewmodel = {
            title: '',
            logoUrl: '',
            createdOn: '',
            viewSettings: null,
            backgroundProps: null,
            pdfExportEnabled: ko.observable(false),
            height: ko.observable(null),

            cssName: ko.computed(getCssName),
            activate: activate
        };

        return viewmodel;

        //public methods
        function activate(viewSettings, pdfExportEnabled) {
            viewmodel.viewSettings = viewSettings;
            viewmodel.pdfExportEnabled = pdfExportEnabled;
            viewmodel.title = context.course.title;
            viewmodel.logoUrl = templateSettings.logoUrl;
            viewmodel.createdOn = context.course.createdOn;

            var background = templateSettings.background;

            viewmodel.backgroundProps = {
                brightness: background.header.brightness || 0,
                color: background.header.color || 'transparent',
                isBodyEnabled: background.body.enabled,
                image: {
                    url: background.header.image && background.header.image.url,
                    option: background.header.image && background.header.image.option || 'fullscreen'
                }
            };
        }

        function getCssName() {
            var activeItem = router.activeItem();

            if (_.isObject(activeItem)) {
                var moduleId = activeItem.__moduleId__;

                return moduleId.slice(moduleId.lastIndexOf('/') + 1);
            }

            return '';
        }
    });