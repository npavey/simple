﻿define(['guard', 'constants', 'models/contentBlock', 'models/questions/multipleSelectQuestion',
        'models/questions/fillInTheBlankQuestion', 'models/questions/dragAndDropQuestion',
        'models/questions/singleSelectImageQuestion', 'models/questions/textMatchingQuestion',
        'models/questions/informationContent', 'models/questions/statementQuestion', 'models/questions/hotspot',
        'models/questions/openQuestion', 'models/questions/scenarioQuestion', 'models/questions/rankingTextQuestion'
    ],
    function (guard, constants, ContentBlock, MultipleSelectQuestion, FillInTheBlankQuestion, DragAndDropQuestion,
        SingleSelectImageQuestion, TextMatchingQuestion, InformationContent,
        StatementQuestion, Hotspot, OpenQuestion, ScenarioQuestion, RankingText) {
        "use strict";

        return {
            createQuestion: createQuestion,
        };

        function createQuestion(sectionId, question, shortId) {
            guard.throwIfNotString(sectionId, 'sectionId is invalid');
            guard.throwIfNotAnObject(question, 'Question data is invalid');
            guard.throwIfNotString(question.type, 'Question type is invalid');
            
            var questionData = {
                id: question.id,
                shortId: shortId,
                sectionId: sectionId,
                title: question.title,
                type: question.type,
                learningContents: _.map(question.learningContents, function (learningContent) {
                    return mapContentBlock(learningContent);
                }),
                questionInstructions: _.map(question.questionInstructions, function (instruction) {
                    return mapContentBlock(instruction);
                }),
                score: 0,
                voiceOver: question.voiceOver,
                hasCorrectFeedback: question.hasCorrectFeedback,
                hasIncorrectFeedback: question.hasIncorrectFeedback
            };

            if (question.hasOwnProperty('isSurvey')) {
                questionData.isSurvey = question.isSurvey;
            }

            switch (question.type) {
                case constants.questionTypes.multipleSelect:
                case constants.questionTypes.singleSelectText:
                    questionData.answers = question.answers;
                    return new MultipleSelectQuestion(questionData);
                case constants.questionTypes.dragAndDrop:
                    questionData.background = question.background;
                    questionData.dropspots = question.dropspots;
                    return new DragAndDropQuestion(questionData);
                case constants.questionTypes.fillInTheBlank:
                    questionData.answerGroups = question.answerGroups;
                    questionData.hasContent = question.hasContent;
                    return new FillInTheBlankQuestion(questionData);
                case constants.questionTypes.singleSelectImage:
                    questionData.correctAnswerId = question.correctAnswerId;
                    questionData.answers = question.answers;
                    return new SingleSelectImageQuestion(questionData);
                case constants.questionTypes.textMatching:
                    questionData.answers = question.answers;
                    return new TextMatchingQuestion(questionData);
                case constants.questionTypes.informationContent:
                    return new InformationContent(questionData);
                case constants.questionTypes.statement:
                    questionData.statements = question.answers;
                    return new StatementQuestion(questionData);
                case constants.questionTypes.hotspot:
                    questionData.spots = question.spots;
                    questionData.isMultiple = question.isMultiple;
                    questionData.background = question.background;
                    return new Hotspot(questionData);
                case constants.questionTypes.openQuestion:
                    return new OpenQuestion(questionData);
                case constants.questionTypes.scenario:
                    questionData.embedCode = question.embedCode;
                    questionData.masteryScore = question.masteryScore;
                    questionData.projectId = question.projectId;
                    questionData.embedUrl = question.embedUrl;
                    return new ScenarioQuestion(questionData);
                case constants.questionTypes.rankingText:
                    questionData.rankingItems = question.answers;
                    return new RankingText(questionData);
                default:
                    return null;
            }
        }

        function mapContentBlock(item) {
            return new ContentBlock({
                id: item.id,
                children: _.map(item.children, function(childrenItem) {
                    return mapContentBlock(childrenItem);
                })
            });
        }
    });