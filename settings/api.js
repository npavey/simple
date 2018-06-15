(function () {
    var apiData = {
        isInited: false
    };

    var accessTypes = {
        free: 0,
        starter: 1,
        team: 4,
        academy: 5
    };

    var
        baseUrl = location.protocol + '//' + location.host,
        identifyUrl = baseUrl + '/auth/identity',
        settingsUrl = baseUrl + '/api/course/' + getURLParameter('courseId') + '/template/' + getURLParameter('templateId'),

        templateUrl = location.toString().substring(0, location.toString().indexOf('/settings/')) + '/',
        manifestUrl = templateUrl + 'manifest.json', //TODO: Change way of resolving manifest file path

        headers = { 'Authorization': 'Bearer ' }
    ;

    window.egApi = {
        init: init,
        getManifest: getManifest,
        getUser: getUser,
        getSettings: getSettings,
        saveSettings: saveSettings,
        sendNotificationToEditor: sendNotificationToEditor,
        showSettings: showSettings,
        showCertificatesUpgradePopup: showCertificatesUpgradePopup
    };

    function getSettingsToken() {
        return getCookie('token.settings');
    }

    function init() {
        headers.Authorization += (getURLParameter('token') || getSettingsToken());

        /* DEBUG */
        var userDataPromise = $.Deferred().resolve([{ data: { subscription: { accessType: 1, expirationDate: new Date(2020, 1, 1) } } }]);
        var settingsPromise = $.getJSON('../../settings.js').then(function (response) { return [{ settings: JSON.stringify(response) }]; });
        var manifestPromise = $.getJSON(manifestUrl);
        /* END_DEBUG */

        /* RELEASE
        var userDataPromise = $.ajax({
            url: identifyUrl,
            headers: headers,
            cache: false,
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        });

        var settingsPromise = $.ajax({
            url: settingsUrl,
            headers: headers,
            cache: false,
            contentType: 'application/json',
            dataType: 'json'
        });

        var manifestPromise = $.ajax({
            url: manifestUrl,
            headers: headers,
            cache: false,
            contentType: 'application/json',
            dataType: 'json'
        });
        END_RELEASE */

        return $.when(manifestPromise, userDataPromise, settingsPromise).done(function (manifestResponse, userDataResponse, settingsResponse) {
            apiData.manifest = getManifestModel(manifestResponse[0]);
            apiData.user = getUserModel(userDataResponse[0]);
            apiData.settings = getSettingsModel(settingsResponse[0]);
            apiData.isInited = true;
        });
    }

    function isInitedGuard() {
        if (!apiData.isInited) {
            throw "Sorry, but you've tried to use api before it was initialized";
        }
    }

    function getManifest() {
        isInitedGuard();
        return apiData.manifest;
    }

    function getUser() {
        isInitedGuard();
        return apiData.user;
    }

    function getSettings() {
        isInitedGuard();
        return apiData.settings;
    }

    function getManifestModel(manifestData) {
        if (manifestData && manifestData.languages && manifestData.languages.length > 0) {
            for (var i = 0; i < manifestData.languages.length; i++) {
                manifestData.languages[i].url = templateUrl + manifestData.languages[i].url;
            }
        }

        return manifestData;
    }

    function getUserModel(userData) {
        userData = userData.data;
        var user = new User(accessTypes.free);
        if (userData.subscription &&
            userData.subscription.accessType &&
            userData.subscription.accessType >= accessTypes.starter &&
            new Date(userData.subscription.expirationDate) >= new Date()
        ) {
            user.accessType = userData.subscription.accessType;
        }
        return user;
    }

    function getSettingsModel(settingsData) {
        var settings;
        if (settingsData.settings && settingsData.settings.length > 0) {
            settings = JSON.parse(settingsData.settings);
        } else {
            settings = {};
        }

        return settings;
    }

    function getURLParameter(name) {
        var param = RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || null;
        return param === null ? null : decodeURI(param[1]);
    }

    function saveSettings(settings, extraSettings, successSaveMessage, failSaveMessage) {
        freezeEditor();

        var data = {
            settings: settings,
            extraSettings: extraSettings
        };

        var requestArgs = {
            url: settingsUrl,
            type: 'POST',
            headers: headers,
            cache: false,
            dataType: 'json',
            data: data
        }

        return $.ajax(requestArgs).done(function () {
            sendNotificationToEditor(successSaveMessage, true);
        }).fail(function () {
            sendNotificationToEditor(failSaveMessage, false);
        }).always(function () {
            unfreezeEditor();
        });
    }

    function freezeEditor() {
        postMessageToEditor({ type: 'freeze-editor' });
    }

    function unfreezeEditor() {
        postMessageToEditor({ type: 'unfreeze-editor' });
    }

    function sendNotificationToEditor(message, isSuccess) {
        postMessageToEditor({ type: 'notification', data: { success: isSuccess, message: message } });
    }

    function showCertificatesUpgradePopup() {
        postMessageToEditor({ type: 'upgrade-popup', data: { type: 'certificates' } });
    }

    function showSettings() {
        postMessageToEditor({ type: 'show-settings' });
    }

    function postMessageToEditor(data) {
        var editorWindow = window.parent;
        editorWindow.postMessage(data, '*');
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return undefined;
    }

    function User(accessType){
        this.accessType = accessType,
        this.hasTeamAccess= function() {
            return this.accessType >= accessTypes.team && this.accessType !== accessTypes.academy;
        };
    }

})();
