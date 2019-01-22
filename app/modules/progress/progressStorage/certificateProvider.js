define(['./urlProvider', './httpWrapper', './auth', 'templateSettings'],
    function (urlProvider, httpWrapper, auth, templateSettings) {
        'use strict';

        function CertificateProvider() {
            this.getCertificateUrl = function (courseId, templateId, courseTitle, score, logoUrl) {
                var headers = auth.headers;
                headers['X-UI-Culture'] = getCulture();

                var urlCheckPattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/

                var newLogoUrl = function () {
                    if(logoUrl && !urlCheckPattern.test(logoUrl)) {
                        if(logoUrl.match(/\/\//g)) {
                            return 'https:' + logoUrl;
                        }
                        return  'https://' + logoUrl;
                    }
                    else {
                        return logoUrl;
                    }
                }
                
                return httpWrapper.post(urlProvider.progressStorageUrl + 'certificates', {
                    courseId: courseId,
                    templateId: templateId,
                    courseTitle: courseTitle,
                    score: score,
                    logoUrl: newLogoUrl()
                }, headers).then(function (response) {
                    return response.url;
                });
            }
        }

        //todo: remove this temp fix
        function getCulture() {
            return templateSettings.languages.selected === 'ua' ? 'uk' : templateSettings.languages.selected;
        }

        return new CertificateProvider();
    });