(function (app) {

    var
        currentSettings = null,
        currentExtraData = null;

    var viewModel = {
        isError: ko.observable(false),

        trackingData: null,
        masteryScore: null,
        languages: null,
        pdfExport: null,
        nps: null,
        webhooks: null,
        showConfirmationPopup: ko.observable(true),
        allowContentPagesScoring: ko.observable(false),
        allowCrossDeviceSaving: ko.observable(true),
        allowSocialLogin: ko.observable(true),
        allowxApiSettings: ko.observable(true),
        allowCertificateDownload: ko.observable(false),
        copyright: ko.observable(''),
        copyrightPlaceholder: ko.observable('')
    };

    viewModel.getCurrentSettingsData = function (settings) {
        return $.extend({}, settings || currentSettings, {
            pdfExport: viewModel.pdfExport.getData(),
            nps: viewModel.nps.getData(),
            webhooks: viewModel.webhooks.getData(),
            xApi: viewModel.trackingData.getData(),
            masteryScore: viewModel.masteryScore.getData(),
            languages: viewModel.languages.getData(),
            showConfirmationPopup: viewModel.showConfirmationPopup(),
            allowContentPagesScoring: viewModel.allowContentPagesScoring(),
            allowCrossDeviceSaving: viewModel.allowCrossDeviceSaving(),
            allowLoginViaSocialMedia: viewModel.allowSocialLogin(),
            allowxApiSettings: viewModel.allowxApiSettings(),
            allowCertificateDownload: viewModel.allowCertificateDownload(),
            copyright: viewModel.copyright()
        });
    };

    viewModel.getCurrentExtraData = function () {
        return {};
    };

    viewModel.saveChanges = function () {
        var settings = viewModel.getCurrentSettingsData(),
            extraData = viewModel.getCurrentExtraData(),
            newSettings = JSON.stringify(settings),
            newExtraData = JSON.stringify(extraData);

        if (JSON.stringify(currentSettings) === newSettings && JSON.stringify(currentExtraData) === newExtraData) {
            return;
        }

        window.egApi.saveSettings(newSettings, newExtraData, app.localize('changes are saved'), app.localize('changes are not saved'))
            .done(function () {
                currentSettings = settings;
                currentExtraData = extraData;
            });
    };

    viewModel.onBeforeCertificateDownloadUpdated = function (newValue) {
        if (newValue && !viewModel.canUpdateAllowCertificateDownload){
            window.egApi.showCertificatesUpgradePopup();
            return false;
        }

        return true;
    };

    viewModel.init = function () {
        var api = window.egApi;
        return api.init().then(function () {
            var manifest = api.getManifest(),
                settings = api.getSettings(),
                user = api.getUser();

            var defaultTemplateSettings = manifest && manifest.defaultTemplateSettings ? manifest.defaultTemplateSettings : {};

            viewModel.pdfExport = new app.PdfExport(settings.pdfExport || defaultTemplateSettings.pdfExport);
            viewModel.nps = new app.Nps(settings.nps || defaultTemplateSettings.nps);
            viewModel.webhooks = new app.Webhooks(settings.webhooks || defaultTemplateSettings.webhooks);
            viewModel.masteryScore = new app.MasteryScore(settings.masteryScore || defaultTemplateSettings.masteryScore);
            viewModel.trackingData = new app.TrackingDataModel(settings.xApi || defaultTemplateSettings.xApi);

            viewModel.languages = new app.LanguagesModel(manifest.languages, settings.languages || defaultTemplateSettings.languages);
            viewModel.canUpdateAllowCertificateDownload = user.hasTeamAccess();

            initField(viewModel.showConfirmationPopup, 'showConfirmationPopup');
            initField(viewModel.allowContentPagesScoring, 'allowContentPagesScoring');
            initField(viewModel.allowCrossDeviceSaving, 'allowCrossDeviceSaving');
            initField(viewModel.allowSocialLogin, 'allowLoginViaSocialMedia');
            initField(viewModel.allowxApiSettings, 'allowxApiSettings');
            initField(viewModel.allowCertificateDownload, 'allowCertificateDownload');
            initField(viewModel.copyright, 'copyright', localizeCopyright);
            viewModel.copyrightPlaceholder(localizeCopyright(app.localize('copyrightPlaceholder')));

            currentSettings = viewModel.getCurrentSettingsData(settings);
            currentExtraData = viewModel.getCurrentExtraData();

            function initField(field, property, handler) {
                var val = null;
                if (settings.hasOwnProperty(property)) {
                    val = settings[property];
                } else if (defaultTemplateSettings.hasOwnProperty(property)) {
                    val = defaultTemplateSettings[property];
                }

                if (val !== null) {
                    field(handler ? handler(val) : val);
                }
            }

        }).fail(function () {
            viewModel.isError(true);
        });
    };

    viewModel.init().always(function () {
        $(document).ready(function () {
            ko.applyBindings(viewModel, $('.settings-container')[0]);
            $(window).on('blur', viewModel.saveChanges);
        });
    });

    function localizeCopyright(copyrightText) {
        return copyrightText.replace('{year}', new Date().getFullYear());
    }

})(window.app = window.app || {});