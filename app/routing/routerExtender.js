define(['plugins/router'], function (router) {
    "use strict";

    function execute() {

        router.isNavigationLocked = ko.observable(false);

        router.activeInstruction.subscribe(function (instruction) {
            if (_.isObject(instruction)
                && !_.isNullOrUndefined(instruction.queryParams)
                && !_.isNullOrUndefined(instruction.queryParams.lock)) {

                var lock = instruction.queryParams.lock.toLowerCase() == "true";
                router.isNavigationLocked(lock);

                var activationData = instruction.params;
                _.each(activationData, function (item) {
                    if (_.isObject(item) && !_.isNullOrUndefined(item.lock)) {
                        delete item['lock'];
                    }

                    if (_.isEmpty(item)) {
                        var i = _.indexOf(activationData, item);
                        activationData.splice(i, 1);
                    }
                });

                instruction.params = activationData;
            }
        });

        router.getQueryStringValue = function (key) {
            var urlParams = window.location.href;
            var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
            var results = regex.exec(urlParams);
            return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
        };

    }

    return {
        execute: execute
    };
})