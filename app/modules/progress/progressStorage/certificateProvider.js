define(['./urlProvider', './httpWrapper', './auth', 'templateSettings'], 
function(urlProvider, httpWrapper, auth, templateSettings) {
    'use strict';

    function CertificateProvider() {
        this.getCertificateUrl = function(courseId, templateId, courseTitle, score){
            var headers = auth.headers;
            headers['X-UI-Culture'] = getCulture();
            return httpWrapper.get(urlProvider.progressStorageUrl + 'certificates', {
                courseId: courseId,
                templateId: templateId,
                courseTitle: courseTitle,
                score: score
            }, headers).then(function(response){
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