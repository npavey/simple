define(['eventManager', 'modules/progress/progressStorage/auth', 'helpers/requestResender'],
    function (eventManager, auth, requestResender) {
        'use strict';
        
        var constants = {
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

            var requestOptions = {
                url: url,
                dataType: 'jsonp',
                xhrFields: {
                    withCredentials: true
                }
            };

            return requestResender.send(requestOptions, onError);
        }

        function onError() {
            return constants.errorMessage;
        }
    }
);