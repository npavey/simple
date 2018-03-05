define(['knockout', 'durandal/composition'], function (ko, composition) {
    ko.bindingHandlers.fillInTheBlankAnswers = {
        init: function (element, valueAccessor) {
            var $element = $(element),
                value = valueAccessor().inputValues(),
                content = valueAccessor().content;

            $element.html(content);

            $(".blankSelect").select({
                defaultText: TranslationPlugin.getTextByKey('[fill in the blank choose answer]')
            });

            _.each(value, function (blank) {
                var source = $('[data-group-id=' + blank.id + ']', $element),
                    handler = function () {
                        blank.value = source.val().trim();
                    },
                    stopPropagationHandler = function (event) {
                        event.stopPropagation();
                    };

                source.val(undefined)
                    .on('blur change', handler)
                    .on('keydown', stopPropagationHandler);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    source.off('blur change', handler);
                    source.off('keydown', stopPropagationHandler);
                });
            });
        },
        update: function (element, valueAccessor) {
            var $element = $(element),
                isAnswered = ko.utils.unwrapObservable(valueAccessor().isAnswered),
                inputValues = ko.utils.unwrapObservable(valueAccessor().inputValues);

            if (!isAnswered) {
                $('.blankSelect')
                    .select('refresh')
                    .select('enabled', true);

                $('.blankInput').each(function () {
                    $(this).val('');
                    $(this).removeAttr('disabled');
                });
            } else {
                _.each(inputValues, function (blank) {
                    var $source = $('[data-group-id=' + blank.id + ']', $element);
                    var defaultText = '...';

                    if ($source.is('input')) {
                        $source.val(blank.value || defaultText);
                        $source.attr('disabled', 'disabled');
                    } else if ($source.is('select')) {
                        $source.select('updateValue', blank.value || defaultText);
                        $source.select('enabled', false);
                    }
                });
            }
        }

    };

    composition.addBindingHandler('fillInTheBlankAnswers');

});