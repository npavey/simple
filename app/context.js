define(['models/course', 'models/section', 'publishSettings', 'models/questions/questionsFactory'],
    function (Course, Section, publishSettings, questionsFactory) {

        var _response;

        function mapCourse(response) {
            var questionShortIds = publishSettings.questionShortIds || {};

            this.course = new Course({
                id: response.id,
                templateId: response.templateId,
                title: response.title,
                hasIntroductionContent: response.hasIntroductionContent,
                sections: _.chain(response.sections)
                    .filter(function (item) {
                        return !_.isNullOrUndefined(item.questions) && item.questions.length > 0;
                    })
                    .map(function (section) {
                        return new Section({
                            id: section.id,
                            title: section.title,
                            imageUrl: section.imageUrl,
                            questions: _.chain(section.questions).map(function (question) {
                                return questionsFactory.createQuestion(section.id, question, questionShortIds[question.id]);
                            }).filter(function(question){
                                return question != null;
                            }).value()
                        });
                    })
                    .value(),
                createdOn: new Date(response.createdOn),
                createdBy: response.createdBy
            });
        }

        var
            course = {},

            initialize = function () {
                var that = this;
                
                if(_response){
                    mapCourse.call(that, _response);
                    return;
                }

                var dfd = Q.defer();

                $.ajax({
                    url: 'content/data.js',
                    contentType: 'application/json',
                    dataType: 'json',
                    cache: false
                }).done(function (response) {
                    _response = JSON.parse(JSON.stringify(response));
                    mapCourse.call(that, _response);
                    dfd.resolve({
                        course: that.course
                    });
                }).fail(function () {
                    dfd.reject('Unable to load data.js');
                });

                return dfd.promise;
            };

        return {
            initialize: initialize,
            course: course,
            isInReviewAttemptMode: function () {
                return !!this.course.isFinished;
            }
        };
    });