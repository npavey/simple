define(['durandal/app', 'constants'],
    function(app, constants) {

        "use strict";

        var
            appOperations = {
                close: close
            };

        return appOperations;

        function close(spec) {
            spec = spec || { shouldCloseWindow: true };
            if (spec.shouldCloseWindow && window.opener && window !== window.opener) {
                window.close();
            }
            app.trigger(constants.events.appClosed);
        }
    }
);