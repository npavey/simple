(function (app) {
    app.SectionsPageModel = SectionsPageModel;
    app.TreeOfContentModel = TreeOfContentModel;
    app.SectionsLayoutModel = SectionsLayoutModel;

    function SectionsPageModel(settings, saveChanges) {
        var that = this;

        that.enabled = ko.observable(true);
        that.getData = getData;
        init(settings);

        function init(settings) {
            if (settings && settings.enabled !== undefined) {
                that.enabled(settings.enabled);
            }

            that.enabled.subscribe(function () {
                saveChanges();
            });
        }

        function getData() {
            return {
                enabled: that.enabled()
            }
        }
    }

    function TreeOfContentModel(settings, saveChanges) {
        var that = this;

        that.enabled = ko.observable(true);
        that.getData = getData;
        init(settings);

        function init(settings) {
            if (settings) {
                that.enabled(settings.enabled);
            }

            that.enabled.subscribe(function () {
                saveChanges();
            });
        }

        function getData() {
            return {
                enabled: that.enabled()
            }
        }
    }

    function SectionsLayoutModel(layoutSettings, saveChanges) {
        var that = this;

        that.list = [
            new LayoutModel('Tiles', true),
            new LayoutModel('List'),
        ];

        that.selectedLayoutName = ko.computed(function () {
            var selectedName = '';
            ko.utils.arrayForEach(that.list, function (layout) { //foreach because of we need to track selecting of all themes
                if (layout.isSelected()) {
                    selectedName = layout.name;
                }
            });
            return selectedName;
        }, that);

        that.select = select;
        that.selectByName = selectByName;
        that.getData = getData;

        init(layoutSettings);

        return that;

        function init(layoutSettings) {
            if (!layoutSettings || !layoutSettings.key) {
                return;
            }
            that.selectByName(layoutSettings.key);
        }

        function select(item) {
            ko.utils.arrayForEach(that.list, function (layout) {
                layout.isSelected(false);
            });

            item.isSelected(true);

            saveChanges();
        }

        function selectByName(name) {
            ko.utils.arrayForEach(that.list, function (layout) {
                layout.isSelected(layout.name === name);
            });

        }

        function getData() {
            
            return {
                key: that.selectedLayoutName()
            };
        }

        function LayoutModel(name, isSelected) {
            var that = this;

            that.name = name;
            that.isSelected = ko.observable(isSelected === true);

            return that;
        }
    }

})(window.app = window.app || {});
