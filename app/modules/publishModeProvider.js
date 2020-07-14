define(['includedModules/modulesInitializer', 'templateSettings'], function(modulesInitializer, templateSettings) {

    "use strict";

    var viewmodel = {
        init: init,
        isPreview: false,
        isScormEnabled: false,
        isReview: false
    };

    function init(publishMode) {
        if (publishMode === 'Lms' || publishMode === 'Lms2004') {
            viewmodel.isScormEnabled = modulesInitializer.hasModule('lms');
            templateSettings.allowCrossDeviceSaving = false;
        }
        if (publishMode === 'Review') {
            viewmodel.isReview = true;
        }
        if (publishMode === 'Preview') {
            viewmodel.isPreview = true;
        }

        if (viewmodel.isPreview || viewmodel.isReview) {
            templateSettings.allowCrossDeviceSaving = false;
            templateSettings.xApi.enabled = false;
            templateSettings.nps.enabled = false;
        }
    }

    return viewmodel;
});