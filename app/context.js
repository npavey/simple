define([
  'models/course',
  'models/section',
  'publishSettings',
  'models/questions/questionsFactory',
  'requester/resourceLoader'
], function (Course, Section, publishSettings, questionsFactory, resourceLoader) {
  function mapCourse(response) {
    var questionShortIds = publishSettings.questionShortIds || {};

    this.course = new Course({
      id: response.id,
      templateId: response.templateId,
      title: response.title,
      hasIntroductionContent: response.hasIntroductionContent,
      introductions: _.chain(response.introductions)
        .filter(function (item) {
          return !_.isNullOrUndefined(item.id);
        })
        .map(function (item) {
          return {
            id: item.id,
            children: item.children
          };
        })
        .value(),
      sections: _.chain(response.sections)
        .filter(function (item) {
          return !_.isNullOrUndefined(item.questions) && item.questions.length > 0;
        })
        .map(function (section) {
          return new Section({
            id: section.id,
            title: section.title,
            imageUrl: section.imageUrl,
            questions: _.chain(section.questions)
              .map(function (question) {
                return questionsFactory.createQuestion(section.id, question, questionShortIds[question.id]);
              })
              .filter(function (question) {
                return question != null;
              })
              .value()
          });
        })
        .value(),
      createdOn: new Date(response.createdOn),
      createdBy: response.createdBy,
      authorContactEmail: response.authorContactEmail,
      authorPersonalPhone: response.authorPersonalPhone,
      authorShortBio: response.authorShortBio,
      authorAvatarUrl: response.authorAvatarUrl
    });
  }

  var course = {},
    initialize = function () {
      var that = this;

      var dfd = Q.defer();

      resourceLoader
        .getLocalResource({
          url: 'content/data.js',
          requestOptions: {
            contentType: 'application/json',
            dataType: 'json'
          }
        })
        .done(function (response) {
          mapCourse.call(that, response);
          dfd.resolve({
            course: that.course
          });
        })
        .fail(function () {
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
