define(['durandal/system', 'durandal/app', 'plugins/router', 'eventManager', 'context', 'userContext', 'constants'],
    function (system, app, router, eventManager, dataContext, userContext, constants) {

        var
            statuses = constants.progressContext.statuses,
            self = {
                storage: null,
                progress: {
                    url: null,
                    answers: {},
                    user: null,
                    attemptId: system.guid(),
                    finished: false
                }
            },
            context = {
                get: get,
                remove: remove,
                finish: finish,

                use: use,
                ready: ready,
                restoreProgress: restoreProgress,

                status: ko.observable(statuses.undefined)
            };

        return context;

        function save(callback) {
            if (!self.storage) {
                return;
            }

            var savedProgressResults = self.storage.saveProgress(self.progress);
            if (_.isObject(savedProgressResults) && _.isFunction(savedProgressResults.then)
                && _.isFunction(savedProgressResults.fail)) {
                savedProgressResults.then(function () {
                    context.status(statuses.saved);
                    callback && callback();
                }).fail(function () {
                    context.status(statuses.error);
                    callback && callback();
                });
            } else {
                context.status(savedProgressResults ? statuses.saved : statuses.error);
            }
            saveResults();
            return savedProgressResults;
        }

        function navigated(obj, instruction) {
            if (self.progress.finished) {
                return;
            }

            if (instruction.config.moduleId === 'xApi/viewmodels/xAPIError' ||
                instruction.config.moduleId === 'viewmodels/404' ||
                instruction.config.moduleId === 'account/account' ||
                instruction.config.moduleId === 'account/signin/index' ||
                instruction.config.moduleId === 'account/register/index' ||
                instruction.config.moduleId === 'account/limitAccess/index') {
                return;
            }
            if (_.isNull(self.progress.url)) {
                self.progress.url = instruction.fragment;
                save();
            } else if (self.progress.url != instruction.fragment) {
                self.progress.url = instruction.fragment;
                save();
            }
        }

        function authenticated(user) {
            self.progress.user = user;
        }

        function authenticationSkipped() {
            self.progress.user = 0;
        }

        function questionAnswered(question) {
            try {
                self.progress.answers[question.shortId] = question.progress();
                save();
            } catch (e) {
                console.error(e);
            }
        }

        function finish(callback) {
            callback = callback || function () { };

            if (self.progress) {
                self.progress.finished = true;
                save(callback);
                return;
            }

            callback();
        }

        function get() {
            return self.progress;
        }

        function remove(callback) {
            callback = callback || function () { };
            if (!self.storage) {
                callback();
                return;
            }
            saveResults();
            if (_.isFunction(self.storage.removeProgress)) {
                var promise = self.storage.removeProgress();
                if (_.isObject(promise) && _.isFunction(promise.then)) {
                    promise.then(callback);
                } else {
                    callback();
                }
            } else {
                callback();
            }
        }

        function saveResults() {
            if (_.isFunction(self.storage.saveResults)) {
                self.storage.saveResults();
            }
        }

        function use(storage) {
            if (_.isFunction(storage.getProgress) && _.isFunction(storage.saveProgress)) {
                clear();

                self.storage = storage;

                restore(userContext.getCurrentUser());

                eventManager.subscribeForEvent(eventManager.events.answersSubmitted).then(questionAnswered);

                app.on('user:authenticated').then(authenticated);
                app.on('user:authentication-skipped').then(authenticationSkipped);

                router.on('router:route:activating', navigated);

                window.onbeforeunload = function () {
                    if (context.status() === statuses.error) {
                        return TranslationPlugin.getTextByKey('[progress cannot be saved]');
                    }
                }
            } else {
                throw 'Cannot use this storage';
            }
        }

        function ready() {
            return !!self.storage;
        }

        function clear() {
            self = {
                storage: null,
                progress: {
                    url: null,
                    answers: {},
                    user: null,
                    attemptId: system.guid(),
                    finished: false
                }
            }
        }

        function restore(user) {
            var progress = self.storage.getProgress();
            if (!_.isEmpty(progress) &&
                _.isString(progress.attemptId) &&
                ((!user) || (!progress.user) || (user.username == progress.user.username && user.email == progress.user.email))) {
                self.progress = progress;
            }
        }

        function restoreProgress() {
            dataContext.initialize();
            var progress = null;

            if (context.ready()) {
                progress = context.get();
                if (_.isObject(progress)) {
                    if (progress.finished) {
                        dataContext.course.finish(null, true);
                    }
                    if (_.isObject(progress.answers)) {
                        _.each(dataContext.course.sections, function (section) {
                            _.each(section.questions, function (question) {
                                if (!_.isNullOrUndefined(progress.answers[question.shortId])) {
                                    question.progress(progress.answers[question.shortId]);
                                }
                                if (progress.finished) {
                                    question.markAsAnswered();
                                }
                            });
                        });
                    }
                }
                window.location.hash = !_.isString(progress.url) ? '' : progress.url.replace('objective', 'section'); //fix for old links
            }
        }
    });