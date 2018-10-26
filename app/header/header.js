define([
    'knockout', 'underscore', 'plugins/router', 'context', 'templateSettings', 'publishSettings', 'displaySettings'
], function (ko, _, router, context, templateSettings, publishSettings, displaySettings) {

        'use strict';
        var viewmodel = {
            version: '',
            title: '',
            logo: {
                url: '',
                maxWidth: '',
                maxHeight: '',
            },
            viewSettings: null,
            backgroundProps: null,
            pdfServiceUrl: null,
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
            viewmodel.pdfServiceUrl = '//' + publishSettings.pdfConverterUrl;
            viewmodel.version = context.course.id + (+new Date(context.course.createdOn));
            viewmodel.title = context.course.title;
            viewmodel.logo.url = templateSettings.logo.url;
            viewmodel.logo.maxWidth = templateSettings.logo.maxWidth || '300px';
            viewmodel.logo.maxHeight = templateSettings.logo.maxHeight || '100px';

            var background = templateSettings.background,
                backgroundType = background.header.image && background.header.image.option || 'fullscreen';

            viewmodel.backgroundProps = {
                brightness: background.header.brightness || 0,
                color: background.header.color || 'transparent',
                isBodyEnabled: background.body.enabled,
                image: {
                    url: background.header.image && background.header.image.url,
                    backgroundPosition: displaySettings.backgroundSettings[backgroundType].position || '0 0',
                    backgroundSize: displaySettings.backgroundSettings[backgroundType].size || 'auto',
                    backgroundRepeat: displaySettings.backgroundSettings[backgroundType].repeat || 'no-repeat'
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