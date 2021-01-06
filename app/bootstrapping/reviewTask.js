define(['plugins/router', 'durandal/app', 'context', 'constants', 'templateSettings'], function (router, app, context, constants, templateSettings) {
    "use strict";

    var task = {
        execute: execute
    };

    return task;

    function execute() {
        if (!supportedBrowser.isBrowserSupported())
            return;

        var reviewApiUrl = router.getQueryStringValue('reviewApiUrl');
        var authoringToolDomain = router.getQueryStringValue('authoringToolDomain');
        if (!reviewApiUrl)
            return;

        postMessage({ supportsNativeReview: true });

        app.on(constants.events.appInitialized, function () {
            pluginsLocalizationService.init(templateSettings.languages.selected);

            var reviewPlugin = new ReviewPlugin();
            reviewPlugin.init({
                reviewApiUrl: decodeURIComponent(reviewApiUrl),
                authoringToolDomain: decodeURIComponent(authoringToolDomain),
                courseId: context.course.id
            });

            router.on('router:navigation:composition-complete').then(function () {
                reviewPlugin.renderSpots();
            });
        });

        function postMessage(data) {
            var editorWindow = window.parent;
            editorWindow.postMessage(data, '*');
        }
    }
});
