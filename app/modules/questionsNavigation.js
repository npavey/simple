define(['repositories/sectionRepository', 'plugins/router', 'underscore', 'modules/publishModeProvider'],
    function (sectionRepository, router, _, publishModeProvider) {
        function getNavigationContext(sectionId, questionId) {
            var section = sectionRepository.get(sectionId);

            if (section && section.questions) {
                var currentItemIndex = _getItemIndexById(section.questions, questionId);
                if (currentItemIndex > -1) {
                    return {
                        previousQuestionUrl: _getQuestionUrl(section, section.questions[currentItemIndex - 1]),
                        currentQuestionUrl: _getQuestionUrl(section, section.questions[currentItemIndex]),
                        nextQuestionUrl: _getQuestionUrl(section, section.questions[currentItemIndex + 1]),                        
                        questionsCount: section.questions.length,
                        currentQuestionIndex: currentItemIndex + 1,
                        nextSectionUrl: getNextSectionUrl(section)
                    };
                }
            }
        }

        function redirectToQuestion() {
            if (!publishModeProvider.isPreview) {
                return;
            }

            var questionId = router.getQueryStringValue('questionId');
            if (_.isNullOrUndefined(questionId)) {
                return;
            }

            var section = sectionRepository.getSectionByQuestionId(questionId);
            if (_.isNullOrUndefined(section)) {
                return;
            }

            window.location.hash = '#section/' + section.id + '/question/' + questionId;
        }

        function _getItemIndexById(collection, itemId) {
            for (var i = 0, count = collection.length; i < count; i++) {
                if (collection[i].id === itemId) {
                    return i;
                }
            }
            return -1;
        }

        function _getQuestionUrl(section, question) {
            if (section && question) {
                return '#section/' + section.id + '/question/' + question.id;
            }

            return undefined;
        }

        function getNextSectionUrl(section) {
            if (!section) {
                return;
            }

            var nextSection = getNextSection(section);
            if (nextSection) {
                return  _getQuestionUrl(nextSection, nextSection.questions[0]);
            }
        }

        function getNextSection(currentSection) {
            var sections = sectionRepository.getCollection();

            for (var i = 0; i < sections.length; i++) {
                if (sections[i].id === currentSection.id) {
                    return sections[i + 1];
                }
            }
        }

        return {
            getNavigationContext: getNavigationContext,
            redirectToQuestion: redirectToQuestion
        };
    });