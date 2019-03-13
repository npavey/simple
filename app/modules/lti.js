define(['eventManager', 'modules/progress/progressStorage/auth', 'helpers/requestResender', 'errorTracking/errorTracker'],
    function (eventManager, auth, requestResender, errorTracker) {
        'use strict';
        
        var constants = {
            resultCallbackUrlParameterName: 'ltiResultCallbackUrl',
            errorMessage: 'Something went wrong and your final score has not been reported ' + 
                '({reason}). Please contact the author of the course.'
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
            var requestOptions = {
                url: resultCallbackUrl,
                method: 'POST',
                dataType: 'json',
                xhrFields: {
                    withCredentials: true
                },
                data: {
                    score: course.score() / 100
                }
            };

            return requestResender.send(requestOptions, onError);
        }

        function onError(response) {
            var errorMessage = 'LTI reporting failed. Code: ' + response.status + ', Reason: ' + response.responseText;

            errorTracker.trackError(new Error(errorMessage));
            
            return constants.errorMessage.replace('{reason}', errorMessage);
        }
    }
);