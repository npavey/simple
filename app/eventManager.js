define(['durandal/app'],
    function (app) {

        var
            events = {
                courseStarted: "courseStarted",
                courseFinished: "courseFinished",
                courseFinalized: "courseFinalized",
                courseEvaluated: 'courseEvaluated',
                answersSubmitted: "answersSubmitted",
                learningContentExperienced: "learningContentExperienced"
            },

            turnAllEventsOff = function () {
                _.each(events, function (event) {
                    app.off(event);
                });
            },

            subscribeForEvent = function (event) {
                if (!events.hasOwnProperty(event)) {
                    throw 'Unsupported event';
                }

                return app.on(event);
            },

            unsubscribeForEvent = function(event, callback) {
                if (!events.hasOwnProperty(event)) {
                    throw 'Unsupported event';
                }

                return app.off(event, callback);
            },

            courseStarted = function (data) {
                app.trigger(events.courseStarted, data);
            },

            courseEvaluated = function (data) {
                return executeAfterSubscribersDone(events.courseEvaluated, data);
            },

            courseFinished = function (data) {
                return executeAfterSubscribersDone(events.courseFinished, data);
            },

            courseFinalized = function () {
                return executeAfterSubscribersDone(events.courseFinalized, {});
            },

            answersSubmitted = function (data, sendParentProgress) {
                app.trigger(events.answersSubmitted, data, sendParentProgress);
            },
            
            learningContentExperienced = function (data, spentTime) {
                app.trigger(events.learningContentExperienced, data, spentTime);
            },
            
            executeAfterSubscribersDone = function (event, eventData) {
                if (_.isNullOrUndefined(app.callbacks) || _.isNullOrUndefined(app.callbacks[event])) {
                    return Q();
                }

                var promises = [];
                _.each(app.callbacks[event], function (handler) {
                    if (_.isFunction(handler)) {
                        var promise = handler(eventData);

                        if (Q.isPromise(promise)) {
                            promises.push(promise);
                        }
                    }
                });

                return Q.all(promises);
            };

        return {
            events: events,
            turnAllEventsOff: turnAllEventsOff,
            subscribeForEvent: subscribeForEvent,
            unsubscribeForEvent: unsubscribeForEvent,

            courseStarted: courseStarted,
            courseFinished: courseFinished,
            courseFinalized: courseFinalized,
            courseEvaluated: courseEvaluated,
            answersSubmitted: answersSubmitted,
            learningContentExperienced: learningContentExperienced
        };
    }
);