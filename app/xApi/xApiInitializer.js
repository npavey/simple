define(['durandal/app', 'plugins/router', './routingManager', './requestManager', './activityProvider', './configuration/xApiSettings', './constants', './statementQueueHandler',
        './errorsHandler', 'context', 'progressContext', 'userContext', 'eventManager'
    ],
    function(app, router, routingManager, requestManager, activityProvider, xApiSettingsConfig, constants, statementQueueHandler, errorsHandler, context, progressContext,
        userContext, eventManager) {
        "use strict";

        var self = {
                isUserAuthenticated: false,
                npsSettings: null,
                xApiSettings: null,
            },
            xApiInitializer = {
                initialize: initialize,
                deactivate: deactivate,
                isLrsReportingInitialized: false,
                isNpsReportingInitialized: false,
                isInitialized: false,
                activate: activate
            };

        return xApiInitializer;

        function initialize(xApiReportingSettings, npsReportingSettings) {
            return Q.fcall(function() {
                self.xApiSettings = xApiReportingSettings;
                self.npsSettings = npsReportingSettings;

                if (!self.xApiSettings.enabled && !self.npsSettings.enabled)
                    return;

                routingManager.mapRoutes();
                self.isCourseStarted = checkIsCourseStarted();
                return initializeTracking()
                    .then(function() {
                        activateReporting();
                        if (!self.isCourseStarted) {
                            return eventManager.courseStarted();
                        }
                    })
                    .fail(onInitializationFailed);
            });
        }

        function activate(user) {
            return initializeActor(user)
                .then(function() {
                    activateReporting();
                })
                .fail(onInitializationFailed);
        }

        function deactivate() {
            deactivateLrsReporting();
            deactivateNpsReporting();
            xApiInitializer.isInitialized = false;
        }

        function initializeTracking() {
            return initializeActorFromContext().then(function() {
                initializeActivity();

                return requestManager.init()
                    .then(function() {
                        xApiInitializer.isInitialized = true;
                    });
            });
        }

        function activateReporting() {
            if (!self.isUserAuthenticated)
                return;

            if (self.xApiSettings.enabled) activateXapiReporting();
            if (self.npsSettings.enabled) activateNpsReporting();
        }

        function activateXapiReporting() {
            xApiSettingsConfig.initxApi(self.xApiSettings);
            activityProvider.subscribeToxApiEvents();

            statementQueueHandler.handle();
            xApiInitializer.isLrsReportingInitialized = true;
        }

        function activateNpsReporting() {
            xApiSettingsConfig.initNps(self.npsSettings);
            activityProvider.subscribeToNpsEvents();

            xApiInitializer.isNpsReportingInitialized = true;
        }

        function deactivateLrsReporting() {
            activityProvider.turnOffxApiSubscriptions();
            xApiInitializer.isLrsReportingInitialized = false;
            app.trigger('user:authentication-skipped');
        }

        function deactivateNpsReporting() {
            activityProvider.turnOffNpsSubscriptions();
            xApiInitializer.isNpsReportingInitialized = false;
        }

        function initializeActorFromContext() {
            return Q.fcall(function() {
                var user = userContext.getCurrentUser(),
                    progress = progressContext.get();

                if (user && user.username && (constants.patterns.email.test(user.email) || user.account)) {
                    return initializeActor(user);
                }

                if (_.isObject(progress)) {
                    if (_.isObject(progress.user)) {
                        return initializeActor(progress.user);
                    }
                    if (progress.user === 0) {
                        deactivateLrsReporting();
                        return;
                    }
                }
            });
        }

        function initializeActor(user) {
            return Q.fcall(function() {
                var actor = {};

                actor.username = user.username;
                actor.email = user.email || (user.account ? user.account.name : '');
                if (user.account)
                    actor.account = user.account;

                self.isUserAuthenticated = true;
                app.trigger('user:authenticated', user);

                return activityProvider.initActor(actor.username, actor.email, actor.account);
            });
        }

        function initializeActivity() {
            return Q.fcall(function() {
                var id = context.course.id;
                var title = context.course.title;

                var url = "";
                if (window != window.top && ('referrer' in document)) {
                    url = document.referrer;
                } else {
                    url = window.location.toString();
                }

                url = url + '?course_id=' + context.course.id;

                activityProvider.initActivity(id, title, url);
            });
        }

        function onInitializationFailed(reason) {
            console.log(reason);
            deactivate();
            if (self.xApiSettings.enabled)
                errorsHandler.handleError(reason);
        }

        function checkIsCourseStarted() {
            var progress = progressContext.get();
            return _.isObject(progress) && _.isObject(progress.user);
        }
    }
);