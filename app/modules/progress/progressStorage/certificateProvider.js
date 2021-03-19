define(['./urlProvider', 'requester/httpWrapper', './auth', 'templateSettings', 'helpers/idToUuid'], function (
  urlProvider,
  httpWrapper,
  auth,
  templateSettings,
  idToUuid
) {
  'use strict';

  function CertificateProvider() {
    this.getCertificateUrl = function (courseId, templateId, logoUrl) {
      var headers = auth.headers;
      headers['Authorization'] = 'Bearer ' + auth.getToken();
      headers['X-UI-Culture'] = getCulture();

      var urlCheckPattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

      var newLogoUrl = function () {
        if (logoUrl && !urlCheckPattern.test(logoUrl)) {
          if (logoUrl.match(/\/\//g)) {
            return 'https:' + logoUrl;
          }
          return 'https://' + logoUrl;
        } else {
          return logoUrl;
        }
      };

      return httpWrapper
        .get({
          url:
            urlProvider.learnServiceUrl +
            '/api/learner/me/courses/' +
            idToUuid(courseId) +
            '/attempts/last/certificate?templateId=' +
            templateId +
            '&logoUrl=' +
            newLogoUrl(),
          headers
        })
        .then(function (response) {
          return response.url;
        });
    };
  }

  //todo: remove this temp fix
  function getCulture() {
    return templateSettings.languages.selected === 'ua' ? 'uk' : templateSettings.languages.selected;
  }

  return new CertificateProvider();
});
