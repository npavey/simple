define(['./models/statement', './models/activity', './models/activityDefinition', 'eventManager', './errorsHandler', './configuration/xApiSettings',
    './constants', './models/result', './models/score', './models/context', './models/contextActivities', './models/languageMap',
    './models/interactionDefinition', './utils/dateTimeConverter', './statementQueue', 'constants', 'guard', 'repositories/sectionRepository', 'progressContext', 'context',
    './statementSender', './models/actor'],
    function (statementModel, activityModel, activityDefinitionModel, eventManager, errorsHandler, xApiSettings, constants,
        resultModel, scoreModel, contextModel, contextActivitiesModel, languageMapModel, interactionDefinitionModel, dateTimeConverter, statementQueue,
        globalConstants, guard, sectionRepository, progressContext, courseContext, statementSender, actorModel) {

        "use strict";

        var subscriptions = [],
            activityProvider = {
                actor: null,
                activityName: null,
                activityUrl: null,

                initActivity: initActivity,
                initActor: initActor,
                subscribeToxApiEvents: subscribeToxApiEvents,
                turnOffxApiSubscriptions: unsubscribeFromxApiEvents,
                subscribeToNpsEvents: subscribeToNpsEvents,
                turnOffNpsSubscriptions: unsubscribeFromNpsEvents,
                rootCourseUrl: null,
                turnOffSubscriptions: turnOffSubscriptions,
                courseId: null
            },
            sessionId = function () {
                return progressContext.get().attemptId;
            };

        return activityProvider;

        function initActivity(courseId, activityName, activityUrl) {
            return Q.fcall(function () {
                if (_.isUndefined(xApiSettings.scoresDistribution.positiveVerb)) {
                    throw errorsHandler.errors.notEnoughDataInSettings;
                }

                activityProvider.activityName = activityName;
                activityProvider.activityUrl = activityUrl;
                activityProvider.rootCourseUrl = activityUrl !== undefined ? activityUrl.split("?")[0].split("#")[0] : '';
                activityProvider.courseId = courseId;
            });
        }

        function initActor(name, email, account) {
            return Q.fcall(function () {
                activityProvider.actor = createActor(name, email, account);
            });
        }

        function subscribeToxApiEvents() {
            unsubscribeFromxApiEvents();

            subscribeToEvent(eventManager.events.courseStarted, enqueueCourseStarted);
            subscribeToEvent(eventManager.events.courseFinished, enqueueCourseFinished);
            subscribeToEvent(eventManager.events.learningContentExperienced, enqueueLearningContentExperienced);
            subscribeToEvent(eventManager.events.answersSubmitted, enqueueQuestionAnsweredStatement);
        }

        function unsubscribeFromxApiEvents() {
            unsubscribeFromEvent(eventManager.events.courseStarted, enqueueCourseStarted);
            unsubscribeFromEvent(eventManager.events.courseFinished, enqueueCourseFinished);
            unsubscribeFromEvent(eventManager.events.learningContentExperienced, enqueueLearningContentExperienced);
            unsubscribeFromEvent(eventManager.events.answersSubmitted, enqueueQuestionAnsweredStatement);
        }

        function subscribeToNpsEvents() {
            unsubscribeFromNpsEvents();
            
            subscribeToEvent(eventManager.events.courseEvaluated, handleCourseEvaluated);
        }

        function unsubscribeFromNpsEvents() {
            unsubscribeFromEvent(eventManager.events.courseEvaluated, handleCourseEvaluated);
        }

        function turnOffSubscriptions() {
            _.each(subscriptions, function (subscription) {
                if (!_.isNullOrUndefined(subscription && subscription.off)) {
                    subscription.off();
                }
            });
        }

        // #region Event handlers

        function handleCourseEvaluated(data) {
            guard.throwIfNotAnObject(data, 'Data is not an object');
            guard.throwIfNotString(data.response, 'Data response is not a string');
            guard.throwIfNotNumber(data.score, 'Data score is not a number');

            var statement = createStatement(constants.verbs.evaluated,
                                            new resultModel({ score: new scoreModel(data.score), response: data.response }),
                                            createActivity(null, activityProvider.activityName, constants.activityTypes.course),
                                            createContextModel());

            return statementSender.sendNpsStatement(statement);
        }

        function enqueueCourseStarted() {
            pushStatementIfSupported(createStatement(constants.verbs.started));
        }

        function enqueueCourseFinished(course) {
            guard.throwIfNotAnObject(course, 'Course is not an object');

            if (_.isArray(course.sections)) {
                _.each(course.sections, function (section) {
                    if (_.isArray(section.questions)) {
                        _.each(section.questions, function (question) {
                            if (question.affectProgress && !question.isAnswered) {
                                enqueueQuestionAnsweredStatement(question);
                            }
                        });
                    }

                    var sectionUrl = activityProvider.rootCourseUrl + '#sections?section_id=' + section.id;
                    var score = section.affectProgress ? new scoreModel(section.score() / 100) : undefined;
                    var statement = createStatement(constants.verbs.mastered, new resultModel({ score: score }), createActivity(sectionUrl, section.title));
                    pushStatementIfSupported(statement);
                });
            }

            var result = new resultModel({
                score: new scoreModel(course.result())
            });

            var resultVerb = course.isCompleted() ? xApiSettings.scoresDistribution.positiveVerb : constants.verbs.failed;
            pushStatementIfSupported(createStatement(resultVerb, result));
            pushStatementIfSupported(createStatement(constants.verbs.stopped));

            var dfd = Q.defer();

            statementQueue.statements.subscribe(function (newValue) {
                if (newValue.length === 0) {
                    dfd.resolve();
                }
            });

            // (^\ x_x /^)
            statementQueue.enqueue(undefined);

            return dfd.promise;
        }

        function enqueueCourseProgressedStatement(course) {
            guard.throwIfNotAnObject(course, 'Course is not an object');

            var result = new resultModel({
                score: new scoreModel(course.result())
            });

            pushStatementIfSupported(createStatement(constants.verbs.progressed, result, createActivity(null, activityProvider.activityName, constants.activityTypes.course)));
        }

        function enqueueSectionProgressedStatement(section) {
            guard.throwIfNotAnObject(section, 'Section is not an object');

            var sectionUrl = activityProvider.rootCourseUrl + '#sections?section_id=' + section.id;
            var score = section.affectProgress ? new scoreModel(section.score() / 100) : undefined;
            var statement = createStatement(constants.verbs.progressed, new resultModel({ score: score }), createActivity(sectionUrl, section.title, constants.activityTypes.objective));
            pushStatementIfSupported(statement);
        }

        function enqueueLearningContentExperienced(question, spentTime) {
            pushStatementIfSupported(getLearningContentExperiencedStatement(question, spentTime));
        }

        function enqueueQuestionAnsweredStatement(question, sendParentProgress) {
            try {
                guard.throwIfNotAnObject(question, 'Question is not an object');

                var section = sectionRepository.get(question.sectionId);
                guard.throwIfNotAnObject(section, 'Section is not found');

                var parts = null;
                var contextObj = {};
                contextObj.extensions = {};
                switch (question.type) {
                    case globalConstants.questionTypes.multipleSelect:
                    case globalConstants.questionTypes.singleSelectText:
                        parts = getSelectTextQuestionActivityAndResult(question);
                        break;
                    case globalConstants.questionTypes.fillInTheBlank:
                        parts = getFillInQuestionActivityAndResult(question, contextObj);
                        break;
                    case globalConstants.questionTypes.singleSelectImage:
                        parts = getSingleSelectImageQuestionAcitivityAndResult(question);
                        break;
                    case globalConstants.questionTypes.statement:
                        parts = getStatementQuestionActivityAndResult(question);
                        break;
                    case globalConstants.questionTypes.dragAndDrop:
                        parts = getDragAndDropTextQuestionActivityAndResult(question, contextObj);
                        break;
                    case globalConstants.questionTypes.textMatching:
                        parts = getMatchingQuestionActivityAndResult(question);
                        break;
                    case globalConstants.questionTypes.hotspot:
                        parts = getHotSpotQuestionActivityAndResult(question, contextObj);
                        break;
                    case globalConstants.questionTypes.openQuestion:
                        parts = getOpenQuestionActivityAndResult(question);
                        break;
                    case globalConstants.questionTypes.scenario:
                        parts = getScenarioQuestionActivityAndResult(question);
                        break;
                    case globalConstants.questionTypes.rankingText:
                        parts = getRankingTextQuestionActivityAndResult(question);
                        break;
                    case globalConstants.questionTypes.informationContent:
                        parts = getInformationContentActivityAndResult(question);
                        break;
                }

                var parentUrl = activityProvider.rootCourseUrl + '#sections?section_id=' + section.id;

                contextObj.contextActivities = new contextActivitiesModel({
                    parent: [createActivity(parentUrl, section.title)]
                });

                contextObj.extensions[constants.extenstionKeys.surveyMode] = question.hasOwnProperty('isSurvey') && question.isSurvey;
                contextObj.extensions[constants.extenstionKeys.questionType] = question.type;

                var context = createContextModel(contextObj);

                if (parts) {
                    var verb = question.type === globalConstants.questionTypes.informationContent ?
                        constants.verbs.experienced : constants.verbs.answered;

                    var statement = createStatement(verb, parts.result, parts.object, context);
                    if (statement) {
                        pushStatementIfSupported(statement);
                        if (sendParentProgress) {
                            enqueueSectionProgressedStatement(section);
                            enqueueCourseProgressedStatement(courseContext.course);
                        }
                    }
                }

            } catch (e) {
                console.error(e);
            }
        }

        // #endregion

        // #region Statement creation

        function getSelectTextQuestionActivityAndResult(question) {
            return {
                result: new resultModel({
                    score: new scoreModel(question.score() / 100),
                    response: getItemsIds(question.answers, function (item) {
                        return item.isChecked;
                    }).join("[,]")
                }),
                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.choice,
                        correctResponsesPattern: !!question.isSurvey ? [] : [
                            getItemsIds(question.answers, function (item) {
                                return item.isCorrect;
                            }).join("[,]")
                        ],
                        choices: _.map(question.answers, function (item) {
                            return {
                                id: item.id,
                                description: new languageMapModel(item.text)
                            };
                        })
                    })
                })
            };
        }

        function getStatementQuestionActivityAndResult(question) {
            return {
                result: new resultModel({
                    score: new scoreModel(question.score() / 100),
                    response: _.chain(question.statements).filter(function (statement) {
                        return !_.isNullOrUndefined(statement.userAnswer);
                    }).map(function (statement) {
                        return statement.id + '[.]' + statement.userAnswer;
                    }).value().join("[,]")
                }),
                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.choice,
                        correctResponsesPattern: !!question.isSurvey ? [] : [
                            _.map(question.statements, function (item) {
                                return item.id + '[.]' + item.isCorrect;
                            }).join("[,]")
                        ],
                        choices: _.map(question.statements, function (item) {
                            return {
                                id: item.id,
                                description: new languageMapModel(item.text)
                            };
                        })
                    })
                })
            };
        }

        function getSingleSelectImageQuestionAcitivityAndResult(question) {
            return {
                result: new resultModel({
                    score: new scoreModel(question.score() / 100),
                    response: question.checkedAnswerId || ''
                }),
                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.choice,
                        correctResponsesPattern: [[question.correctAnswerId].join("[,]")],
                        choices: _.map(question.answers, function (item) {
                            return {
                                id: item.id,
                                description: new languageMapModel(item.image)
                            };
                        })
                    })
                })
            };

        }

        function getFillInQuestionActivityAndResult(question, contextObj) {
            contextObj.extensions[constants.extenstionKeys.content] = question.content;
            return {
                result: new resultModel({
                    score: new scoreModel(question.score() / 100),
                    response: _.map(question.answerGroups, function (item) {
                        return item.answeredText + "[.]" + item.id;
                    }).join("[,]")
                }),
                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.fillIn,
                        correctResponsesPattern: [
                            _.flatten(_.map(question.answerGroups, function (item) {
                                return item.getCorrectText() + "[.]" + item.id;
                            })).join("[,]")
                        ]
                    })
                })
            };
        }

        function getHotSpotQuestionActivityAndResult(question, contextObj) {
            contextObj.extensions[constants.extenstionKeys.imageUrl] = question.background;
            return {
                result: new resultModel({
                    score: new scoreModel(question.score() / 100),
                    response: _.map(question.placedMarks, function (mark) {
                        return '(' + mark.x + ',' + mark.y + ')';
                    }).join("[,]")
                }),
                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.other,
                        correctResponsesPattern: [_.map(question.spots, function (spot) {
                            var polygonCoordinates = _.map(spot, function (spotCoordinates) {
                                return '(' + spotCoordinates.x + ',' + spotCoordinates.y + ')';
                            });
                            return polygonCoordinates.join("[.]");
                        }).join("[,]")]
                    })
                })
            }
        }

        function getDragAndDropTextQuestionActivityAndResult(question, contextObj) {
            var answerTexts = _.map(question.answers, function (item) {
                return item.text;
            }).join("[,]");
            contextObj.extensions[constants.extenstionKeys.answerTexts] = answerTexts;
            contextObj.extensions[constants.extenstionKeys.imageUrl] = question.background;
            return {
                result: new resultModel({
                    score: new scoreModel(question.score() / 100),
                    response: _.map(question.answers, function (item) {
                        return '(' + item.currentPosition.x + ',' + item.currentPosition.y + ')';
                    }).join("[,]")
                }),

                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.other,
                        correctResponsesPattern: [_.map(question.answers, function (item) {
                            return '(' + item.correctPosition.x + ',' + item.correctPosition.y + ')';
                        }).join("[,]")]
                    })
                })
            }
        }

        function getMatchingQuestionActivityAndResult(question) {
            var targets = _.uniq(_.pluck(question.answers, 'value'));

            return {
                result: new resultModel({
                    score: new scoreModel(question.score() / 100),
                    response: _.map(question.answers, function (answer) {
                        return answer.shortId + "[.]" + (answer.attemptedValue ? _.indexOf(targets, answer.attemptedValue) : "");
                    }).join("[,]")
                }),
                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.matching,
                        correctResponsesPattern: [_.map(question.answers, function (answer) {
                            return answer.shortId + "[.]" + _.indexOf(targets, answer.value);
                        }).join("[,]")],
                        source: _.map(question.answers, function (answer) {
                            return { id: answer.shortId.toString(), description: new languageMapModel(answer.key) }
                        }),
                        target: _.map(targets, function (value, index) {
                            return { id: index.toString(), description: new languageMapModel(value) }
                        })
                    })
                })
            };

        }

        function getOpenQuestionActivityAndResult(question) {
            return {
                result: new resultModel({
                    response: question.answeredText
                }),
                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.other
                    })
                })
            };
        }

        function getScenarioQuestionActivityAndResult(question) {
            return {
                result: new resultModel({
                    score: new scoreModel(question.score() / 100),
                }),
                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.other
                    })
                })
            };
        }

        function getRankingTextQuestionActivityAndResult(question) {
            return {
                result: new resultModel({
                    score: new scoreModel(question.score() / 100),
                    response: _.map(question.rankingItems, function (item) {
                        return item.text.toLowerCase();
                    }).join("[,]")
                }),
                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.sequencing,
                        correctResponsesPattern: [_.map(question.correctOrder, function (item) {
                            return item.text.toLowerCase();
                        }).join("[,]")],
                        choices: _.map(question.rankingItems, function (item) {
                            return {
                                id: item.text,
                                description: new languageMapModel(item.text)
                            };
                        })
                    })
                })
            };
        }

        function getInformationContentActivityAndResult(question) {
            return {
                result: new resultModel({
                    score: new scoreModel(question.score() / 100)
                }),
                object: new activityModel({
                    id: activityProvider.rootCourseUrl + '#section/' + question.sectionId + '/question/' + question.id,
                    definition: new interactionDefinitionModel({
                        name: new languageMapModel(question.title),
                        interactionType: constants.interactionTypes.other
                    })
                })
            };
        }

        function getLearningContentExperiencedStatement(question, spentTime) {
            guard.throwIfNotAnObject(question, 'Question is not an object');
            guard.throwIfNotNumber(spentTime, 'SpentTime is not a number');

            var section = sectionRepository.get(question.sectionId);
            guard.throwIfNotAnObject(section, 'Section is not found');

            var result = new resultModel({
                duration: dateTimeConverter.timeToISODurationString(spentTime)
            });

            var learningContentUrl = activityProvider.rootCourseUrl + '#section/' + section.id + '/question/' + question.id + '?learningContents';
            var parentUrl = activityProvider.rootCourseUrl + '#section/' + section.id + '/question/' + question.id;
            var groupingUrl = activityProvider.rootCourseUrl + '#sections?section_id=' + section.id;
            var object = createActivity(learningContentUrl, question.title);

            var context = createContextModel({
                contextActivities: new contextActivitiesModel({
                    parent: [createActivity(parentUrl, question.title)],
                    grouping: [createActivity(groupingUrl, section.title)]
                })
            });

            return createStatement(constants.verbs.experienced, result, object, context);
        }

        function createContextModel(contextSpec) {
            contextSpec = contextSpec || {};
            var contextExtensions = contextSpec.extensions || {};
            contextExtensions[constants.extenstionKeys.courseId] = activityProvider.courseId;
            contextSpec.extensions = contextExtensions;
            contextSpec.registration = sessionId();

            return new contextModel(contextSpec);
        }

        function createStatement(verb, result, activity, context) {
            var activityData = activity || createActivity(null, activityProvider.activityName);
            context = context || createContextModel();

            return statementModel({
                actor: activityProvider.actor,
                verb: verb,
                object: activityData,
                result: result,
                context: context
            });
        }

        // #endregion

        // #region Utilities

        function createActor(name, email, account) {
            var actor = {};

            try {
                actor = actorModel({
                    name: name,
                    mbox: 'mailto:' + email,
                    account: account
                });
            } catch (e) {
                errorsHandler.handleError(errorsHandler.errors.actorDataIsIncorrect);
            }

            return actor;
        }

        function createActivity(id, name, type) {
            return activityModel({
                id: id || activityProvider.activityUrl,
                definition: new activityDefinitionModel({
                    name: new languageMapModel(name),
                    type: type
                })
            });
        }


        function pushStatementIfSupported(statement) {
            if (_.contains(xApiSettings.xApi.allowedVerbs, statement.verb.display[xApiSettings.defaultLanguage])) {
                statementQueue.enqueue(statement);
            }
        }

        function subscribeToEvent(eventName, eventHandler) {
            subscriptions.push(eventManager.subscribeForEvent(eventName).then(eventHandler));
        }

        function unsubscribeFromEvent(eventName, eventHandler) {
            eventManager.unsubscribeForEvent(eventName, eventHandler);
        }

        function getItemsIds(items, filter) {
            return _.chain(items)
               .filter(function (item) {
                   return filter(item);
               })
               .map(function (item) {
                   return item.id;
               }).value();
        }

        // #endregion

    }
);