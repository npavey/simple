define(function () {
    'use strict';

    var _instance = null;

    var _getAuthLink = function (courseTitle, authServiceUrl, socialNetwork) {
        const addTokenQueryParam =
          window.location.host.indexOf('easygenerator.com') === -1 ? '&addTokenQuery=true' : '';
        return authServiceUrl + '/api/auth/' + socialNetwork +
            '?callbackUrl=' + encodeURIComponent(window.location.href) + addTokenQueryParam;
    };

    function SocialNetworks(courseTitle, authServiceUrl) {
        if (_instance) {
			return _instance;
		}
        var getAuthLink = _getAuthLink.bind(this, courseTitle, authServiceUrl);
        this.facebookAuthLink = getAuthLink('facebook');
        this.linkedinAuthLink = getAuthLink('linkedin');
        this.googleAuthLink = getAuthLink('google');
    }

    return SocialNetworks;
});
