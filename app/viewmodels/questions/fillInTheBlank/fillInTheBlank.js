define(['knockout', 'plugins/http'], function (ko, http) {
	"use strict";

	function FillInTheBlank() {
	    this.question = null;

	    this.content = null;
	    this.loadContent = loadContent;

	    this.isAnswered = ko.observable(false);
	    this.inputValues = ko.observableArray([]);
	};

	FillInTheBlank.prototype.initialize = function(question, isPreview) {
		var self = this;

		return question.load().then(function () {
		    self.question = question;

		    self.isAnswered(question.isAnswered);
		    self.isPreview = ko.observable(_.isUndefined(isPreview) ? false : isPreview);
		    self.inputValues(_.map(question.answerGroups, function (answerGroup) {
		        return {
		            id: answerGroup.id,
		            value: answerGroup.answeredText,
		            answers: answerGroup.answers
		        };
		    }));

		    if (self.question.hasContent) {
		        return self.loadContent();
		    }
		});
	};

	FillInTheBlank.prototype.submit = function() {
		var self = this;

		return Q.fcall(function () {
			self.question.submitAnswer(self.inputValues());
			
			self.isAnswered(true);
		});
	};

	FillInTheBlank.prototype.tryAnswerAgain = function() {
		var self = this;
		
		return Q.fcall(function () {
			_.each(self.inputValues(), function (blankValue) {
				blankValue.value = '';
			});
			self.isAnswered(false);
		});
	};

	return FillInTheBlank;

	function loadContent() {
	    var self = this;
	    return Q.fcall(function () {
	        var contentUrl = 'content/' + self.question.sectionId + '/' + self.question.id + '/content.html';
	        return http.get(contentUrl)
                .then(function (response) {
					self.content = response;
					self.question.content = response;
                })
                .fail(function () {
                    self.content = '';
                });
	    });
	}
});