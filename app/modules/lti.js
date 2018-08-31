define(['q', 'jquery', 'eventManager', 'modules/progress/progressStorage/auth'],
    function (Q, $, eventManager, auth) {
        'use strict';
        
        var constants = {
            sendResultAttemptsTimeout: 10000,
            sendResultAttemptsCount: 10,
            resultCallbackUrlParameterName: 'ltiResultCallbackUrl',
            errorMessage: 'Something went wrong and your final score has not been reported ' + 
                '(reason: LTI reporting failed). Please contact the author of the course.'
        };

        return {
            initialize: initialize
        };

        function initialize() {
            var resultCallbackUrl = auth.getValueFromUrl(constants.resultCallbackUrlParameterName);
            if (!resultCallbackUrl) {
                return;
            }

            eventManager.subscribeForEvent(eventManager.events.courseFinished)
                .then(onCourseFinished.bind(this, resultCallbackUrl));
        }

        function onCourseFinished(resultCallbackUrl, course) {
            var url = resultCallbackUrl + '?score=' + course.score() / 100;

            return sendRequest(url);
        }

        function sendRequest(url, attemptNumber, defer) {
            if (typeof defer === 'undefined') {
                defer = Q.defer();
            }

            if (typeof attemptNumber === 'undefined') {
                attemptNumber = 0;
            }

            $.ajax({
                url: url,
                dataType: 'jsonp',
                xhrFields: {
                    withCredentials: true
                }
            }).always(function (response) {
                if (response.status === 200) {
                    return defer.resolve();
                }
                
                if (attemptNumber >= constants.sendResultAttemptsCount) {
                    return defer.reject(constants.errorMessage);
                }

                setTimeout(function () {
                    sendRequest(url, ++attemptNumber, defer);
                }, constants.sendResultAttemptsTimeout);
            });

            return defer.promise;
        }

    }
);