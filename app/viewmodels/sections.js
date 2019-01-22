﻿define(['underscore', 'context', 'repositories/courseRepository', 'plugins/router', 'templateSettings'],
    function (_, context, repository, router, templateSettings) {

        var
            sections = [],
            masteryScore = 0,
            courseTitle = context.course.title,
            sectionsLayout = null,
            sectionThumbnail = { width: 284, height: 170 },
            
            canActivate = function () {
                if (templateSettings.sectionsPage && !templateSettings.sectionsPage.enabled && !router.isNavigationLocked()) {
                    var section = _.find(context.course.sections, function(section) {
                        return section.questions.length > 0;
                    });

                    if(section) {
                        return { redirect: '#section/' + section.id + '/question/' + section.questions[0].id };
                    } else {
                        return { redirect: '#finish' };
                    }
                }

                return true;
            },

            activate = function () {
                var course = repository.get();
                if (course == null) {
                    router.navigate('404');
                    return;
                }
                this.sectionsLayout = templateSettings.sectionsLayout;
                this.masteryScore = templateSettings.masteryScore.score;

                if (sectionsLayout === "List") {
                    sectionThumbnail.width = 100;
                    sectionThumbnail.height = 70;
                }

                this.sections = _.map(course.sections, function (item) {
                    return {
                        id: item.id,
                        title: item.title,
                        imageUrl: item.imageUrl,
                        imageWidth: sectionThumbnail.width,
                        imageHeight: sectionThumbnail.height,
                        score: item.score(),
                        isMastered: item.score() >= templateSettings.masteryScore.score,
                        scoreTooltipText: getScoreTooltipText(templateSettings.masteryScore.score, item.score()),
                        questions: item.questions,
                        affectProgress: item.affectProgress,
                        goToFirstQuestion: function () {
                            if (router.isNavigationLocked()) {
                                return;
                            }
                            router.navigate('#/section/' + item.id + '/question/' + item.questions[0].id);
                        }
                    };
                });
            }

        return {
            activate: activate,
            canActivate: canActivate,
            isNavigationLocked: router.isNavigationLocked,
            caption: 'Sections and questions',
            courseTitle: courseTitle,
            sectionsLayout: sectionsLayout,
            isInReviewAttemptMode: context.isInReviewAttemptMode(),
            getSectionButtonAccessibilityLabel: getSectionButtonAccessibilityLabel,

            masteryScore: masteryScore,
            sections: sections
        };

        function getSectionButtonAccessibilityLabel(buttonTranslationKey, section) {
            return TranslationPlugin.getTextByKey(buttonTranslationKey) + ' ' + section.title + ' ' + section.score + '% ' + section.scoreTooltipText;
        }
        
        function getScoreTooltipText(masteryScore, score) {
            var scoreToComplete = masteryScore - score;
            return scoreToComplete > 0 ? scoreToComplete + '% ' + TranslationPlugin.getTextByKey('[to complete]') : TranslationPlugin.getTextByKey('[completed]');
        }

    });