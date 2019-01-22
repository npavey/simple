define(function(){
    'use strict';

    return {
        init: init
    };

    function init(templateSettings, manifest, publishSettings, customisations){
        var promises = [];

        window.WebFontLoader && promises.push(window.WebFontLoader.load(templateSettings.fonts, manifest, publishSettings));
        window.LessProcessor && promises.push(window.LessProcessor.load(templateSettings.colors, templateSettings.fonts));
        window.LessProcessor && customisations && customisations.styles && promises.push(window.LessProcessor.loadCustomStyles(customisations.styles));
        
        return Q.all(promises);
    }
});
