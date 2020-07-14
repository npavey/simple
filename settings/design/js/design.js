(function (app) {

    var
        currentSettings = null,
        currentExtraData = null;

    var viewModel = {
        isError: ko.observable(false),

        sectionsPage: null,
        treeOfContent: null,
        sectionsLayout:null
    };

    viewModel.getCurrentSettingsData = function (settings) {
        return $.extend({}, settings || currentSettings, {
            treeOfContent: viewModel.treeOfContent.getData(),
            sectionsLayout: viewModel.sectionsLayout.getData(),
            sectionsPage: viewModel.sectionsPage.getData()
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

        window.egApi.saveDesignSettings(newSettings, newExtraData, app.localize('changes are saved'), app.localize('changes are not saved'))
            .done(function () {
                currentSettings = settings;
                currentExtraData = extraData;
            });
    };

    viewModel.init = function () {
        var api = window.egApi;
        return api.init().then(function () {
            var manifest = api.getManifest();

            var defaultSettings = manifest.defaultTemplateSettings;
            var settings = api.getDesignSettings();

            viewModel.sectionsLayout = new app.SectionsLayoutModel(settings.sectionsLayout || defaultSettings.sectionsLayout, viewModel.saveChanges);
            viewModel.treeOfContent = new app.TreeOfContentModel(settings.treeOfContent || defaultSettings.treeOfContent, viewModel.saveChanges);
            viewModel.sectionsPage = new app.SectionsPageModel(settings.sectionsPage || defaultSettings.sectionsPage, viewModel.saveChanges);

            currentSettings = viewModel.getCurrentSettingsData(settings);
            currentExtraData = viewModel.getCurrentExtraData();

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

})(window.app = window.app || {});
