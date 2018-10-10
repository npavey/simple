define(['plugins/router', 'q', 'constants', 'modules/progress/progressStorage/auth'], function (router, Q, constants, auth) {

    function LoginHelper() {
        this.token = '';
        this.email = '';
        this.username = '';
    }

    var instance = new LoginHelper();

    LoginHelper.prototype.initialize = initialize.bind(instance);

    LoginHelper.prototype.getLoginMethod = getLoginMethod.bind(instance);

    return instance;

    function initialize() {
        var self = this;
        return Q.fcall(function() {
            self.token = auth.getValueFromUrl('token');
            self.email = router.getQueryStringValue('email');
            self.username = router.getQueryStringValue('name');
        });
    }

    function getLoginMethod() {
        if(this.token) {
            return constants.loginTypes.byToken;
        } else if (this.email && this.username) {
            return constants.loginTypes.byEmailAndName;
        }

        return constants.loginTypes.default;
    }
});