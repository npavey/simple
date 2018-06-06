define(['jquery', 'eventManager', 'modules/progress/progressStorage/auth'],
    function ($, eventManager, auth) {
        'use strict';

        return {
            initialize: initialize
        };

        function initialize() {
            var ltiResultCallbackUrl = auth.getValueFromUrl('ltiResultCallbackUrl');
            if (!ltiResultCallbackUrl) {
                return;
            }

            eventManager.subscribeForEvent(eventManager.events.courseFinished)
                .then(onCourseFinished.bind(this, ltiResultCallbackUrl));
        }

        function onCourseFinished(ltiResultCallbackUrl, course) {
            var url = new URL(ltiResultCallbackUrl);
            url.searchParams.append('score', course.score() / 100);

            $.ajax({
                url: url.toString(),
                dataType: 'jsonp',
                xhrFields: {
                    withCredentials: true
                }
            });
        }

    }
);