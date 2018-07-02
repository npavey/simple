define(['guard'], function (guard) {
    var context = function(spec) {
        if (typeof spec == typeof undefined) {
            throw 'You should provide a specification to create Context';
        }

        guard.throwIfNotString(spec.registration, 'You should specify registration field for the context');
        var obj = {};

        obj.registration = spec.registration;
        if (_.isObject(spec.contextActivities)) {
            obj.contextActivities = spec.contextActivities;
        }

        if (_.isObject(spec.extensions)) {
            obj.extensions = spec.extensions;
        }


        return obj;
    };

    return context;
});