(function () {
	"use strict";

	var defaultLogo = '//cdn.easygenerator.com/logo.png';

	$.ajaxSetup({ cache: false });

	$.getJSON('../content/data.js', function (content) {
		$.getJSON('../settings.js', function (settings) {
			var promises = [];

			content.logoUrl = (settings && settings.logo && settings.logo.url) ? settings.logo.url : defaultLogo;
			document.title = 'easygenerator | ' + content.title;

			if (content.hasIntroductionContent) {
				promises.push($.get('../content/content.html', function (response) {
					content.introductionContent = response;
				}));
			}

			ko.utils.arrayForEach(content.sections, function (section) {
				ko.utils.arrayForEach(section.questions, function (question) {
					ko.utils.arrayForEach(question.learningContents, function (learningContent) {
						promises.push($.get('../content/' + section.id + '/' + question.id + '/' + learningContent.id + '.html', function (response) {
							learningContent.html = response;
						}));

						ko.utils.arrayForEach(learningContent.children, function (child) {
							promises.push($.get('../content/' + section.id + '/' + question.id + '/' + child.id + '.html', function (response) {
								child.html = response;
							}));
						});
					});

					ko.utils.arrayForEach(question.questionInstructions, function (questionInstruction) {
						promises.push($.get('../content/' + section.id + '/' + question.id + '/' + questionInstruction.id + '.html', function (response) {
							questionInstruction.html = response;
						}));

						ko.utils.arrayForEach(questionInstruction.children, function (child) {
							promises.push($.get('../content/' + section.id + '/' + question.id + '/' + child.id + '.html', function (response) {
								child.html = response;
							}));
						});
					});

					if (question.type === 'fillInTheBlank' && question.hasContent) {
						promises.push($.get('../content/' + section.id + '/' + question.id + '/content.html', function (response) {
							question.content = response;
						}));
					}
				});
			});

			content.renderingFinished = function () {
				$(document.body).addClass('rendered');
			};

			$.when.apply($, promises).done(function () {
				ko.applyBindings(content);
			});
		});
	});

})();