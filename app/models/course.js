define(['eventManager', 'constants'],
    function(eventManager, constants) {

        var ctor = function(spec) {

            var course = {
                id: spec.id,
                templateId: spec.templateId,
                title: spec.title,

                createdBy: spec.createdBy,
                createdOn: spec.createdOn,

                hasIntroductionContent: spec.hasIntroductionContent,
                sections: spec.sections,
                isFinished: false
            }

            var affectProgressSections = _.filter(course.sections, function(section) {
                return section.affectProgress;
            });

            course.score = function() {
                var result = _.reduce(affectProgressSections, function(memo, section) {
                    return memo + section.score();
                }, 0);

                var sectionsLength = affectProgressSections.length;
                return sectionsLength == 0 ? 0 : Math.floor(result / sectionsLength);
            };

            course.result = function() {
                return course.score() / 100;
            }

            course.isCompleted = function() {
                return !_.some(affectProgressSections, function(section) {
                    return !section.isCompleted();
                });
            };

            course.getStatus = function() {
                if (!course.isFinished) {
                    return constants.course.statuses.inProgress;
                }

                return course.isCompleted() ? constants.course.statuses.completed : constants.course.statuses.failed;
            };

            course.setFinishedStatus = function() {
                course.isFinished = true;
            };

            course.finish = function(callback, withoutEvent) {
                course.isFinished = true;
                if (withoutEvent) {
                    callback && callback();
                } else {
                    eventManager.courseFinished(course, function() {
                        callback && callback();
                    });
                }
            };

            course.finalize = function(callback) {
                eventManager.courseFinalized(function() {
                    eventManager.turnAllEventsOff();
                    if (callback) {
                        callback();
                    }
                });
            }

            course.evaluate = function(score, callbacks) {
                eventManager.courseEvaluated(score, callbacks);
            }

            return course;
        };

        return ctor;
    }
);