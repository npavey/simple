define(['underscore', 'eventManager', 'userContext'], function(_, eventManager, userContext){
    'use strict';

    function WebhooksModule () {
        this.initialized = false;
        this.url = '';
    }

    WebhooksModule.prototype.initialize = function (webhooksSettings) {
        if (this.initialized || !webhooksSettings.url) return;

        this.url = webhooksSettings.url;
        this.initialized = true;
    }

    WebhooksModule.prototype.sendResults = function (course) {
        var defer = Q.defer(),
            user = userContext.getCurrentUser();

        if(!_.isNullOrUndefined(user)) {
            var data = {
                courseId: course.id,
                learnerId: user.email,
                score: course.result() * 100,
                finishedOn: (new Date()).toISOString(),
                status: course.getStatus() === 'completed' ? 'passed' : 'failed'
            };

            fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(function(response) {
                if(response.status !== 200) {
                    defer.reject();
                }

                defer.resolve();
            });
        } else {
            defer.resolve();
        }

        return defer.promise;
    }

    return new WebhooksModule();
});
