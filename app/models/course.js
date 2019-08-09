define(["eventManager", "constants", "templateSettings"], function(
  eventManager,
  constants,
  templateSettings
) {
  var ctor = function(spec) {
    var course = {
      id: spec.id,
      templateId: spec.templateId,
      title: spec.title,

      createdBy: spec.createdBy,
      createdOn: spec.createdOn,

      authorContactEmail: spec.authorContactEmail,
      authorPersonalPhone: spec.authorPersonalPhone,
      authorShortBio: spec.authorShortBio,
      authorAvatarUrl: spec.authorAvatarUrl,

      hasIntroductionContent: spec.hasIntroductionContent,
      introductions: spec.introductions,
      sections: spec.sections,
      isFinished: false
    };

    var affectProgressSections = _.filter(course.sections, function(section) {
      return section.affectProgress;
    });

    course.score = function() {
      var sum = 0;
      var itemCount = 0;
      if (templateSettings.masteryScore.isOverall) {
        itemCount = _.reduce(
          affectProgressSections,
          function(memo, section) {
            var questions = _.filter(section.questions, function(question) {
              return question.affectProgress;
            });
            questions.forEach(function(question) {
              sum += question.score();
            });
            return (memo += questions.length);
          },
          0
        );
      } else {
        itemCount = affectProgressSections.length;
        sum = _.reduce(
          affectProgressSections,
          function(memo, section) {
            return memo + section.score();
          },
          0
        );
      }

      return itemCount == 0 ? 0 : Math.floor(sum / itemCount);
    };

    course.result = function() {
      return course.score() / 100;
    };

    course.isCompleted = function() {
      if (templateSettings.masteryScore.isOverall) {
        if (affectProgressSections.length === 0) {
          return true;
        }

        return course.score() >= templateSettings.masteryScore.score;
      }

      return !_.some(affectProgressSections, function(section) {
        return !section.isCompleted();
      });
    };

    course.getStatus = function() {
      if (!course.isFinished) {
        return constants.course.statuses.inProgress;
      }

      return course.isCompleted()
        ? constants.course.statuses.completed
        : constants.course.statuses.failed;
    };

    course.setFinishedStatus = function() {
      course.isFinished = true;
    };

    course.finish = function(callback, withoutEvent) {
      course.setFinishedStatus();
      course.sections.forEach(function(section) {
        section.questions.forEach(function(question) {
          question.markAsAnswered();
        });
      });

      if (withoutEvent) {
        callback && callback();
      } else {
        eventManager
          .courseFinished(course)
          .fail(function(error) {
            alert(error);
          })
          .fin(function() {
            callback && callback();
          });
      }
    };

    course.finalize = function(callback) {
      eventManager.courseFinalized().then(function() {
        eventManager.turnAllEventsOff();
        if (callback) {
          callback();
        }
      });
    };

    course.evaluate = function(score, callback) {
      eventManager.courseEvaluated(score).fin(function() {
        callback && callback();
      });
    };

    return course;
  };

  return ctor;
});