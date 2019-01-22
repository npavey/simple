define(['plugins/router', 'q', 'constants', 'modules/progress/progressStorage/auth', 'templateSettings'], function (router, Q, constants, auth, templateSettings) {

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
        } else if (this.email && this.username && templateSettings.allowCrossDeviceSaving) {
            return constants.loginTypes.byEmailAndName;
        } else if (this.email && this.username && !templateSettings.allowCrossDeviceSaving) {
            return constants.loginTypes.byEmailAndNameWithoutCrossDeviceSaving;
        }

        return constants.loginTypes.default;
    }
});