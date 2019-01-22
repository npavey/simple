define(['context', '../constants', './httpWrapper', './urlProvider',
        './auth', 'helpers/requestResender'
    ],
    function (context, constants, httpWrapper, urlProvider, auth, requestResender) {
        'use strict';

        function ProgressStorageProvider(courseId, templateId) {
            var _progress = null;
            this.courseId = courseId;
            this.templateId = templateId;

            this.progressKey = constants.progressKey + this.courseId + this.templateId;
            this.resultKey = constants.resultKey + this.courseId + this.templateId;

            this.getProgress = function () {
                return _progress;
            };

            this.setProgress = function (progress){
                _progress = progress;
            };

            this.getProgressFromServer = function () {
                return httpWrapper.get(urlProvider.progressStorageUrl + 'progress', {
                    courseId: this.courseId,
                    templateId: this.templateId,
                }, auth.headers).then(function (response) {
                    _progress = JSON.parse(response.progress);
                    return response.progress;
                });
            }

            this.saveProgress = function (progress) {
                var requestOptions = {
                    url: urlProvider.progressStorageUrl + 'progress',
                    method: 'POST',
                    data: {
                        courseId: this.courseId,
                        templateId: this.templateId,
                        jsonProgress: progress ? JSON.stringify(progress) : null
                    },
                    headers: auth.headers,
                    cache: false
                };

                return requestResender.send(requestOptions);
            };

            this.saveResults = function (getScore, getStatus, errorMessage) {
                //TODO: now we use only localStorage for save results
                var result = {
                    score: context.course.score(),
                    status: context.course.getStatus()
                };

                try {
                    localStorage.setItem(this.resultKey, JSON.stringify(result));
                } catch (e) {
                    alert(TranslationPlugin.getTextByKey('[not enough memory to save progress]'));
                }
                return true;
            };

            this.removeProgress = function (callback) {
                 return httpWrapper.post(urlProvider.progressStorageUrl + 'progress', {
                    courseId: this.courseId,
                    templateId: this.templateId,
                    jsonProgress: null
                }, auth.headers);
            };
        }

        return ProgressStorageProvider;
    });