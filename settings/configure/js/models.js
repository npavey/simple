(function (app) {

    app.TrackingDataModel = TrackingDataModel;
    app.LanguagesModel = LanguagesModel;
    app.MasteryScore = MasteryScore;
    app.PdfExport = PdfExport;
    app.Nps = Nps;
    app.Webhooks = Webhooks;

    function PdfExport(pdfExportSettings) {
        var that = this;

        that.enabled = ko.observable(false);
        that.getData = getData;
        init(pdfExportSettings);

        function init(pdfExportSettings) {
            if (!pdfExportSettings) {
                return;
            }

            that.enabled(pdfExportSettings.enabled);
        }

        function getData() {
            return {
                enabled: that.enabled()
            }
        }
    }

    function Nps(npsSettings) {
        var that = this;

        that.enabled = ko.observable(false);
        that.getData = getData;
        init(npsSettings);

        function init(npsSettings) {
            if (!npsSettings) {
                return;
            }

            that.enabled(npsSettings.enabled);
        }

        function getData() {
            return {
                enabled: that.enabled()
            }
        }
    }

    function Webhooks(webhooksSettings) {
        var that = this;
        var statuses = {
            notChecked: 'notChecked',
            success: 'success',
            error: 'error'
        };
        var _requestCheckData = {
            courseId: "courseId",
            learnerId: "example@example.com",
            score: 75,
            finishedOn: (new Date()).toISOString(),
            status: "passed"
        };

        that.url = ko.observable('');
        that.isChecking = ko.observable(false);
        that.checkStatus = ko.observable(statuses.notChecked);
        that.statuses = statuses;

        that.getData = getData;
        that.checkUrl = checkUrl;
        init(webhooksSettings);

        function init(webhooksSettings) {
            if (!webhooksSettings && !webhooksSettings.url) {
                return;
            }

            that.url(webhooksSettings.url);
        }

        function getData() {
            return {
                url: that.url()
            }
        }

        function checkUrl() {
            that.isChecking(true);
            
            $.ajax({
                url: that.url(),
                type: 'POST',
                cache: false,
                contentType: 'application/json',
                data: JSON.stringify(_requestCheckData)
            })
            .done(function() {
                that.checkStatus(statuses.success);
            })
            .fail(function() {
                that.checkStatus(statuses.error);
            })
            .always(function() {
                that.isChecking(false);
            });
        }
    }

    function TrackingDataModel(xApiSettings) {
        var that = this;

        that.advancedSettingsExpanded = ko.observable(false);

        that.enableXAPI = ko.observable(true);
        that.allowToSkipTracking = ko.observable(true);

        that.reportsOptions = [
            new DataTrackingOption('lrs', true),
            new DataTrackingOption('webhooks')
        ];

        that.lrsOptions = [
            new LrsOption('default', true),
            new LrsOption('custom')
        ];

        that.selectedLrs = ko.computed(function () {
            var selectedName = '';
            ko.utils.arrayForEach(that.lrsOptions, function (lrsOption) { //foreach because of we need to track selecting of all themes
                if (lrsOption.isSelected()) {
                    selectedName = lrsOption.name;
                }
            });
            return selectedName;
        }, that);

        that.customLrsEnabled = ko.computed(function () {
            return that.enableXAPI() && that.selectedLrs() != that.lrsOptions[0].name;
        });

        that.lrsUrl = ko.observable('');
        that.authenticationRequired = ko.observable(false);
        that.lapLogin = ko.observable();
        that.lapPassword = ko.observable();

        that.credentialsEnabled = ko.computed(function () {
            return that.customLrsEnabled() && that.authenticationRequired();
        });

        that.statements = {
            started: ko.observable(true),
            stopped: ko.observable(true),
            experienced: ko.observable(true),
            mastered: ko.observable(true),
            answered: ko.observable(true),
            passed: ko.observable(true),
            failed: ko.observable(true),
            progressed: ko.observable(true)
        };

        that.toggleAdvancedSettings = toggleAdvancedSettings;
        that.selectReports = selectReports;
        that.selectLrs = selectLrs;
        that.selectLrsByName = selectLrsByName;
        that.setStatements = setStatements;
        that.setCustomLrsSettings = setCustomLrsSettings;
        that.getData = getData;

        init(xApiSettings);

        return that;

        function init(xApiSettings) {
            if (!xApiSettings) {
                return;
            }

            that.enableXAPI(xApiSettings.enabled);
            that.allowToSkipTracking(!xApiSettings.required);

            if (xApiSettings.selectedLrs) {
                that.selectLrsByName(xApiSettings.selectedLrs);
            }

            if (xApiSettings.lrs) {
                that.setCustomLrsSettings(xApiSettings.lrs);
            }

            if (xApiSettings.allowedVerbs) {
                that.setStatements(xApiSettings.allowedVerbs);
            }
        }

        function toggleAdvancedSettings() {
            that.advancedSettingsExpanded(!that.advancedSettingsExpanded());
        }

        function selectReports(reportsOption) {
            ko.utils.arrayForEach(that.reportsOptions, function (reportsOption) {
                reportsOption.isSelected(false);
            });
            reportsOption.isSelected(true);
        }

        function selectLrs(lrs) {
            ko.utils.arrayForEach(that.lrsOptions, function (lrsOptions) {
                lrsOptions.isSelected(false);
            });
            lrs.isSelected(true);
        }

        function selectLrsByName(name) {
            ko.utils.arrayForEach(that.lrsOptions, function (lrsOption) {
                lrsOption.isSelected(lrsOption.name === name);
            });
        }

        function setStatements(statements) {
            ko.utils.objectForEach(that.statements, function (key, value) {
                value(statements.indexOf(key) > -1);
            });
        }

        function setCustomLrsSettings(customLrsSettings) {
            that.lrsUrl(customLrsSettings.uri || '');
            that.authenticationRequired(customLrsSettings.authenticationRequired || false);
            that.lapLogin(customLrsSettings.credentials.username || '');
            that.lapPassword(customLrsSettings.credentials.password || '');
        }

        function getData() {
            var allowedVerbs = [];

            ko.utils.objectForEach(that.statements, function (key, value) {
                if (value()) {
                    allowedVerbs.push(key);
                }
            });

            return {
                enabled: that.enableXAPI(),
                required: !that.allowToSkipTracking(),
                selectedLrs: that.selectedLrs(),
                lrs: {
                    uri: that.lrsUrl().trim(),
                    authenticationRequired: that.authenticationRequired(),
                    credentials: {
                        username: that.lapLogin().trim(),
                        password: that.lapPassword().trim()
                    }
                },
                allowedVerbs: allowedVerbs
            };
        }

        function DataTrackingOption(name, isSelected) {
            var that = this;

            that.name = name;
            that.isSelected = ko.observable(isSelected);

            return that;
        }

        function LrsOption(name, isSelected) {
            var that = this;

            that.name = name;
            that.isSelected = ko.observable(isSelected === true);

            return that;
        }
    }

    function LanguagesModel(languages, languagesSettings) {
        var that = this;

        var customLanguageCode = 'xx';
        var defaultLanguageCode = 'en';

        that.languages = [];

        var _selectedLanguageCode = ko.observable((languagesSettings && languagesSettings.selected) ? languagesSettings.selected : null);
        that.selectedLanguageCode = ko.pureComputed({
            read: function () {
                return _selectedLanguageCode();
            },
            write: function (value) {
                var language = getLanguage(value);

                if (!language) {
                    return;
                }

                if (language.isLoaded) {
                    _selectedLanguageCode(value);
                    return;
                }

                that.isLanguageLoading(true);
                language.load().done(function () {
                    _selectedLanguageCode(value);
                    that.isLanguageLoading(false);
                });
            }
        });
        that.selectedLanguageTranslations = ko.pureComputed(function () {
            var language = getLanguage(that.selectedLanguageCode());
            return language ? language.getTranslations() : null;
        });

        that.isLanguageLoading = ko.observable(false);

        that.isLanguageEditable = isLanguageEditable;
        that.getCustomTranslations = getCustomTranslations;

        that.getData = getData;

        init(languages, languagesSettings);

        return that;

        function sortByLanguageName(a, b){
            var aName = a.name.toLowerCase();
            var bName = b.name.toLowerCase(); 
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        }

        function init(languages, languagesSettings) {
            ko.utils.arrayForEach(languages || [], function (language) {
                addLanguage(new LanguageModel(language.code, app.localize(language.code), language.url));
            });

            that.languages.sort(sortByLanguageName);

            var defaultLanguage = getLanguage(defaultLanguageCode);
            var customLanguage = new LanguageModel(customLanguageCode, app.localize(customLanguageCode), defaultLanguage ? defaultLanguage.resourcesUrl : null, languagesSettings ? languagesSettings.customTranslations : null);

            addLanguage(customLanguage);

            var selectedLanguageCode = (languagesSettings && languagesSettings.selected) ? languagesSettings.selected : defaultLanguageCode;
            that.selectedLanguageCode(selectedLanguageCode);
        }

        function isLanguageEditable() {
            return that.selectedLanguageCode() === customLanguageCode;
        }

        function getCustomTranslations() {
            var customLanguage = getLanguage(customLanguageCode);
            if (customLanguage) {
                return customLanguage.getNotMappedTranslations();
            }
            return [];
        }

        function addLanguage(language) {
            that.languages.push(language);
        }

        function getLanguage(code) {
            return ko.utils.arrayFirst(that.languages, function (language) {
                return language.code === code;
            });
        }

        function getData() {
            var settingsData = {};

            if (that.selectedLanguageCode()) {
                settingsData.selected = that.selectedLanguageCode();
            }

            var customTranslations = getCustomTranslations();
            if (customTranslations && !$.isEmptyObject(customTranslations)) {
                settingsData.customTranslations = customTranslations;
            }

            return settingsData;
        }

        function LanguageModel(code, name, resourcesUrl, translations) {
            var that = this,
                _mappedTranslations = [],
                _customTranslations = translations;

            that.code = code;
            that.name = name;

            that.isLoaded = false;
            that.load = load;
            that.resourcesUrl = resourcesUrl;

            that.setTranslations = setTranslations;
            that.getTranslations = getTranslations;
            that.getNotMappedTranslations = getNotMappedTranslations;

            if (translations) {
                that.setTranslations(translations);
            }

            function setTranslations(translations) {
                _mappedTranslations = map(translations);
            }

            function getTranslations() {
                return _mappedTranslations;
            }

            function getNotMappedTranslations() {
                return unmap(_mappedTranslations);
            }

            function load() {
                return loadLanguageResources(that.resourcesUrl).then(function (resources) {
                    if (_customTranslations) {
                        var translationsList = {};
                        $.each(resources, function (key, value) {
                            translationsList[key] = typeof _customTranslations[key] == "string" ? _customTranslations[key] : value;
                        });
                        that.setTranslations(translationsList);
                    } else {
                        that.setTranslations(resources);
                    }
                    that.isLoaded = true;
                });
            }

            function loadLanguageResources(url) {
                return $.ajax({
                    url: url,
                    dataType: 'json',
                    contentType: 'application/json'
                });
            }

            function map(translationsObject) {
                var arr = [];

                if (translationsObject) {
                    Object.keys(translationsObject).forEach(function (key) {
                        arr.push({
                            key: key,
                            value: translationsObject[key]
                        });
                    });
                }

                return arr;
            }

            function unmap(translationsArray) {
                var translationsObj = {};

                if (translationsArray) {
                    translationsArray.forEach(function (translation) {
                        translationsObj[translation.key] = translation.value;
                    });
                }

                return translationsObj;
            }
        }
    }

    function MasteryScore(masteryScoreSettings) {
        var that = this;

        that.score = ko.observable((masteryScoreSettings && masteryScoreSettings.score) ? masteryScoreSettings.score : 100);
        that.getData = getData;

        return that;

        function getData() {
            return {
                score: that.score()
            };
        };
    }

})(window.app = window.app || {});