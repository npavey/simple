define(['helpers/url'], function (Url) {
    ko.bindingHandlers.mediaPlayer = {
        init: function (element, valueAccessor) {

            var
                $element = $(element),
                args = valueAccessor(),
                embedCode = ko.utils.unwrapObservable(args.embedCode);

            $element.html(getMediaEmbedCode());

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $iframe = $element.find('iframe');
                if ($iframe.length) {
                    $iframe.attr('src', 'about:blank');
                }
                $element.empty();
            });

            function getMediaEmbedCode() {

                if (!embedCode)
                    return embedCode;

                var srcAttrName = 'src',
                    $container = $('<div/>').html(embedCode),
                    $iframe = $container.find('iframe'),
                    src = $iframe.attr(srcAttrName),
                    variablesList = getVariablesList();

                src = new Url(src).addQueryStringParam('style_variables', variablesList).toString();

                $iframe.attr(srcAttrName, src);
                return $container.html();
            }
        }
    };

    function getVariablesList() {
        return window.LessProcessor && window.LessProcessor.vars ? JSON.stringify({ '@main-color': window.LessProcessor.vars['@main-color'], '@content-body-color': window.LessProcessor.vars['@content-body-color'], '@text-color': window.LessProcessor.vars['@text-color'] }) : undefined;
    }
})