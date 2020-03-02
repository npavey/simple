define([
    'knockout', 'underscore', 'durandal/app', 'modules/progress/progressStorage/auth', 'durandal/composition', 'plugins/router',
    'routing/routes', 'context', 'includedModules/modulesInitializer', 'templateSettings',
    'progressContext', 'constants', 'userContext', 'errorsHandler',
    'modules/progress/index', 'account/index', 'xApi/xApiInitializer', 'modules/publishModeProvider', 
    'modules/questionsNavigation', 'modules/lti', 'modules/webhooks', 'helpers/loginHelper',
    'modules/progress/progressStorage/urlProvider'
], function (ko, _, app, auth, composition, router, routes, context, modulesInitializer, templateSettings,
    progressContext, constants, userContext, errorsHandler, progressProvider, account, xApiInitializer, publishModeProvider, 
    questionsNavigation, lti, webhooks, loginHelper, urlProvider) {

        'use strict';
        var viewmodel = {
            router: null,
            cssName: null,
            isInReviewMode: false,
            title: '',
            createdOn: null,
            logo: {
                url: '',
                maxWidth: '',
                maxHeight: '',
            },
            pdfExportEnabled: ko.observable(false),
            isClosed: ko.observable(false),
            isNavigatingToAnotherView: ko.observable(false),
            inIframe: window.self !== window.top,

            viewSettings: ko.computed(viewSettings),
            activate: activate
        };

        viewmodel.router = router;
        viewmodel.cssName = ko.computed(function () {
            var activeItem = router.activeItem();
            if (_.isObject(activeItem)) {
                var moduleId = activeItem.__moduleId__;
                moduleId = moduleId.slice(moduleId.lastIndexOf('/') + 1);
                return moduleId;
            }
            return '';
        });

        viewmodel.isInReviewMode = router.getQueryStringValue('reviewApiUrl');

        router.on('router:route:activating')
            .then(function (newView) {
                if (!publishModeProvider.isScormEnabled && !viewmodel.pdfExportEnabled() === templateSettings.pdfExport.enabled) {
                    var isNotAccountModule = newView && (newView.__moduleId__.slice(0, newView.__moduleId__.indexOf('/')) !== 'account');
                    viewmodel.pdfExportEnabled(isNotAccountModule);
                }

                var currentView = router.activeItem();
                if (newView && currentView && newView.__moduleId__ === currentView.__moduleId__) {
                    return;
                }
                viewmodel.isNavigatingToAnotherView(true);
            });

        app.on(constants.events.appClosed)
            .then(function () {
                viewmodel.isClosed(true);
            });

        return viewmodel;

        //public methods
        function activate() {
            return context.initialize()
                .then(initializeUrlProvider)
                .then(auth.authorize)
                .then(loginHelper.initialize)
                .then(userContext.initialize)
                .then(lti.initialize)
                .then(account.enable)
                .then(initializeWebhooks)
                .then(initializeProgressProvider)
                .then(initxApi)
                .then(initApp)
                .then(initRouter)
                .catch(function (e) {
                    console.error(e);
                });

            function initializeUrlProvider() {
                return urlProvider.initialize();
            }

            function initializeWebhooks() {
                if(templateSettings.xApi.enabled) {
                    webhooks.initialize(templateSettings.webhooks);
                }
            }

            function initxApi() {
                return xApiInitializer.initialize(templateSettings.xApi, templateSettings.nps);
            }

            function initializeProgressProvider() {
                if (!publishModeProvider.isScormEnabled && !publishModeProvider.isPreview && !publishModeProvider.isReview) {
                    return progressProvider.initialize().then(function (provider) {
                        progressContext.use(provider);
                    });
                }
            }

            function initApp() {
                return Q.fcall(function () {
                    viewmodel.logo.url = templateSettings.logo.url;
                    viewmodel.logo.maxWidth = templateSettings.logo.maxWidth || '300px';
                    viewmodel.logo.maxHeight = templateSettings.logo.maxHeight || '100px';
                    viewmodel.title = app.title = context.course.title;
                    viewmodel.createdOn = context.course.createdOn;
                    progressContext.restoreProgress();
                    if (context.isInReviewAttemptMode()) {
                        xApiInitializer.deactivate();
                    }
                    app.trigger(constants.events.appInitialized);
                });
            }

            function initRouter() {
                questionsNavigation.redirectToQuestion();
                return router.map(routes.routes).buildNavigationModel().mapUnknownRoutes('viewmodels/404', '404').activate().then(function () {
                    errorsHandler.startHandle();
                });
            }
        }

        function viewSettings() {
            var settings = {
                rootLinkEnabled: false,
                exitButtonVisible: false,
                treeOfContentVisible: false,
                isInReviewAttemptMode: false
            };

            var activeInstruction = router.activeInstruction();
            if (_.isObject(activeInstruction)) {
                settings.rootLinkEnabled = !!activeInstruction.config.rootLinkEnabled && !router.isNavigationLocked();
                settings.exitButtonVisible = showExitButton(activeInstruction.config) && !templateSettings.hideFinishActionButtons;
                settings.treeOfContentVisible = templateSettings.treeOfContent.enabled && !!activeInstruction.config.displayTreeOfContent;
            }
            settings.isInReviewAttemptMode = context.isInReviewAttemptMode();

            return settings;
        }

        function showExitButton(activeInstructionConfig) {
            return !!activeInstructionConfig.showExitButton ||
                (!!activeInstructionConfig.showExitButtonInReviewMode && context.isInReviewAttemptMode());
        }
    });