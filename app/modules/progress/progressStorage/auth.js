define(['./httpWrapper', './urlProvider'], function (httpWrapper, urlProvider) {
    'use strict';

    var _private = {
        tokenKey: 'token.auth.template',
        shortTermAccessKey: 'shortTermAccess.auth.template',
        getToken: function () {
            return localStorage.getItem(_private.tokenKey);
        },
        removeToken: function () {
            localStorage.removeItem(_private.tokenKey);
        }
    };

    var auth = {};

    Object.defineProperty(auth, 'headers', {
        get: function () {
            return {
                'x-access-token': _private.getToken()
            };
        }
    });

    Object.defineProperty(auth, 'authenticated', {
        get: function () {
            return _private.getToken() !== null;
        }
    });

    Object.defineProperty(auth, 'shortTermAccess', {
        get: function () {
            return localStorage.getItem(_private.shortTermAccessKey) === 'true';
        },
        set: function (value) {
            if (typeof value !== 'undefined' && value !== '') {
                localStorage.setItem(_private.shortTermAccessKey, value);
            } else if(value === ''){
                localStorage.removeItem(_private.shortTermAccessKey);
            }
        }
    })

    auth.setToken = function (value) {
        if (typeof value !== 'undefined') {
            localStorage.setItem(_private.tokenKey, value);
        }
    };

    auth.getToken = function () {
        return _private.getToken();
    };

    auth.exists = function (email) {
        return httpWrapper.post(urlProvider.progressStorageUrl + 'user/exists', {
            email: email
        });
    };

    auth.identify = function (email) {
        return httpWrapper.post(urlProvider.progressStorageUrl + 'user', {
            email: email
        }, auth.headers);
    };

    auth.signin = function (email, password, rememberMe) {
        return httpWrapper.post(urlProvider.progressStorageUrl + 'user/signin', {
            email: email,
            password: password,
            shortTermAccess: !rememberMe
        }).then(function (response) {
            auth.setToken(response.token);
            auth.shortTermAccess = !rememberMe;
        });
    };

    auth.register = function (email, password, name, rememberMe) {
        return httpWrapper.post(urlProvider.progressStorageUrl + 'user/register', {
            email: email,
            password: password,
            name: name,
            shortTermAccess: !rememberMe
        }).then(function (response) {
            auth.setToken(response.token);
            auth.shortTermAccess = !rememberMe;
        });
    };

    auth.getValueFromUrl = function (key) {
        key = key || 'token';
        var url = window.location.href,
            regex = new RegExp('[?&]' + key + '(=([^&#]*)|&|#|$)', 'i'),
            result = regex.exec(url);

        if (!result || !result[2]) {
            return null;
        }

        return decodeURIComponent(result[2].replace(/\+/g, ' '));
    };

    auth.signout = function () {
        _private.removeToken();
        auth.shortTermAccess = '';
    };

    auth.sendSecreLink = function (email, courseTitle, password) {
        return httpWrapper.post(urlProvider.progressStorageUrl + 'link', {
            email: email,
            password: password || null,
            courseTitle: courseTitle,
            courseLink: urlProvider.courseLink,
            sendMail: true,
            returnLink: false
        }).then(function (response) {
            auth.setToken(response.token);
        });
    };

    auth.forgotpassword = function(email){
        return httpWrapper.post(urlProvider.progressStorageUrl + 'user/forgotpassword', {
            email: email,
            returnUrl: urlProvider.courseLink
        });
    }

    return auth;

});