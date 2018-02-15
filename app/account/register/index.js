define(['knockout', 'plugins/router', 'context', 'userContext', '../header/index', '../helpers/validatedValue', 'modules/progress/progressStorage/auth',
        'templateSettings', 'xApi/xApiInitializer', 'eventManager', 'modules/progress/index', 'progressContext'
    ],
    function (ko, router, context, userContext, Header, validatedValue,
            auth, templateSettings, xApiInitializer, eventManager, progressProvider, progressContext) {
        'use strict';

        var whitespaceRegex = /\s/;

        var viewmodel = {
            activate: activate,
            header: null,
            name: userContext.user.username || '',
            password: null,
            rememberMe: ko.observable(false),
            isPasswordVisible: ko.observable(false),
            togglePasswordVisibility: togglePasswordVisibility,
            submit: submit,
            toggleRememberMe: toggleRememberMe,
            back: back,
            crossDeviceEnabled: false,
            requestProcessing: ko.observable(false)
        };

        viewmodel.name = validatedValue(function (value) {
            return !!value();
        });

        viewmodel.password = validatedValue(function (value) {
            return value().length >= 7 && !whitespaceRegex.test(value());
        });
        viewmodel.password.noSpaces = ko.observable(false);
        viewmodel.password.moreThanSevenSymbols = ko.observable(false);
        viewmodel.password.onKeyUp = function () {
            if (viewmodel.password().length >= 7) {
                viewmodel.password.moreThanSevenSymbols(true);
            } else {
                viewmodel.password.moreThanSevenSymbols(false);
            }
            if (!whitespaceRegex.test(viewmodel.password())) {
                viewmodel.password.noSpaces(true);
            } else {
                viewmodel.password.noSpaces(false);
            }
        }


        return viewmodel;

        function activate() {
            viewmodel.header = new Header(context.course.title);
            viewmodel.crossDeviceEnabled = templateSettings.allowCrossDeviceSaving;
            if(userContext.user.username){
                viewmodel.name(userContext.user.username);
            }
        }

        function submit() {
            if(viewmodel.requestProcessing()){
                return;
            }
            if (!viewmodel.name.isValid()) {
                viewmodel.name.markAsModified();
                return;
            }
            userContext.user.username = viewmodel.name();
            if (viewmodel.crossDeviceEnabled && !viewmodel.password.isValid()) {
                viewmodel.password.markAsModified();
                return;
            } else if (viewmodel.crossDeviceEnabled && viewmodel.password.isValid()) {
                userContext.user.password = viewmodel.password();
                register();
            } else {
                activateXapi(function () {
                    eventManager.courseStarted();
                    router.navigate('');
                });
            }
        }

        function toggleRememberMe() {
            if(viewmodel.requestProcessing()){
                return;
            }
            viewmodel.rememberMe(userContext.user.keepMeLoggedIn = !viewmodel.rememberMe());
        }

        function togglePasswordVisibility() {
            viewmodel.isPasswordVisible(!viewmodel.isPasswordVisible());
            viewmodel.password.hasFocus(true);
        }

        function back() {
            router.navigate('login');
        }

        function register() {
            viewmodel.requestProcessing(true);
            auth.register(userContext.user.email,
                    userContext.user.password,
                    userContext.user.username,
                    userContext.user.keepMeLoggedIn)
                .then(function (response) {
                    return progressProvider.initProgressStorage(function(provider){
                        progressProvider.clearLocalStorage();
                        progressContext.use(provider);
                        return activateXapi(function () {
                            viewmodel.requestProcessing(false);
                            progressContext.restoreProgress();
                            if (context.isInReviewAttemptMode()) {
                                xApiInitializer.deactivate();
                            }
                            eventManager.courseStarted();
                        });
                    });
                }).fail(function (reason) {
                    viewmodel.requestProcessing(false);
                    if (reason.status == 409) {
                        router.navigate('signin');
                    }
                });
        }

        function activateXapi(callback) {
            if (xApiInitializer.isInitialized) {
                return xApiInitializer.activate(userContext.user).then(callback);
            }
            callback();
        }
    });