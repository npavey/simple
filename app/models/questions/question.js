define(['eventManager', 'guard', 'plugins/http', 'constants'], function (eventManager, guard, http, constants) {
    "use strict";

    function Question(spec, _protected) {
        if (typeof spec == typeof undefined) {
            throw 'You should provide a specification to create an Question';
        }

        this.id = spec.id;
        this.shortId = spec.shortId;
        this.sectionId = spec.sectionId;
        this.title = spec.title;
        this.type = spec.type;
        this.score = ko.observable(spec.score);
        this.learningContents = spec.learningContents;
        this.questionInstructions = spec.questionInstructions;
        this.isAnswered = false;
        this.isCorrectAnswered = false;
        this.affectProgress = true;
        this.isInformationContent = spec.type === constants.questionTypes.informationContent;

        if(spec.hasOwnProperty('isSurvey')){
            this.isSurvey = spec.isSurvey;
            this.affectProgress = !this.isSurvey;
        }

        this.feedback = {
            hasCorrect: spec.hasCorrectFeedback,
            correct: null,

            hasIncorrect: spec.hasIncorrectFeedback,
            incorrect: null
        };
        this.loadFeedback = loadFeedback,

        this.loadLearningContent = loadLearningContent;
        this.loadQuestionInstructions = loadQuestionInstructions;
        this.load = load;

        this.voiceOver = spec.voiceOver;

        this.learningContentExperienced = learningContentExperienced;

        this.loadContent = loadContent;

        this.progress = function (data) {
            if (!this.affectProgress && !this.hasOwnProperty('isSurvey'))
                return 0;

            if (!_.isNullOrUndefined(data)) {
                _protected.restoreProgress.call(this, data);

                this.markAsAnswered();
                this.isCorrectAnswered = this.score() === 100;
            } else {
                return _protected.getProgress.call(this);
            }
        };

        this.submitAnswer = function () {
            this.markAsAnswered();
            
            if (!this.affectProgress && !this.hasOwnProperty('isSurvey'))
                return;
                
            this.score(_protected.submit.apply(this, arguments));

            this.isCorrectAnswered = this.score() === 100;

            eventManager.answersSubmitted(this, true);
        }

        this.markAsAnswered = function() {
            this.isAnswered = true;
        }
    }

    return Question;

    function learningContentExperienced(spentTime) {
        eventManager.learningContentExperienced(this, spentTime);
    }
    
    function loadQuestionInstructions() {
        return this.loadContent(this.questionInstructions);
    }

    function loadLearningContent() {
        return this.loadContent(this.learningContents);
    }

    function load() {
        var that = this;
        return that.loadQuestionInstructions().then(function () {
            return that.loadLearningContent().then(function () {
                return that.loadFeedback();
            });
        });
    }

    function loadFeedback() {
        var
            that = this,
            requests = [],
            feedbackUrlPath = 'content/' + that.sectionId + '/' + that.id + '/',
            correctFeedbackContentUrl = feedbackUrlPath + 'correctFeedback.html',
            incorrectFeedbackContentUrl = feedbackUrlPath + 'incorrectFeedback.html';

        if (that.feedback.hasCorrect) {
            requests.push(loadPage(correctFeedbackContentUrl).then(function (content) {
                that.feedback.correct = content;
            }));
        }
        if (that.feedback.hasIncorrect) {
            requests.push(loadPage(incorrectFeedbackContentUrl).then(function (content) {
                that.feedback.incorrect = content;
            }));
        }

        return Q.allSettled(requests);
    }

    function loadContent(items) {
        var that = this;
        var promises = [];
        _.each(items, function(item) {
            if (typeof item.content === typeof undefined) {
                promises.push(loadPage(item.contentUrl).then(function(content) {
                    item.content = content;
                }));
            }

            return that.loadContent(item.children);
        });

        return Q.allSettled(promises);
    }

    function loadPage(contentUrl) {
        return http.get(contentUrl);
    }

});