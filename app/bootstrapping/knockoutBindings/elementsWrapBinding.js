define(['knockout', 'jquery', 'durandal/composition', 'helpers/url'], function (ko, $, composition, Url) {

    ko.bindingHandlers.elementsWrap = {
        init: function (element) {
            wrapElement(element);
        },

        update: function (element) {
            wrapElement(element);
        }
    };

    function wrapElement(element) {
        var $element = $(element),
                imageWrapper = '<figure class="image-wrapper"></figure>',
                tableWrapper = '<figure class="table-wrapper"></figure>';

        $('img', $element).each(function (index, image) {
            var $image = $(image),
                $wrapper = $(imageWrapper).css('float', $image[0].style.cssFloat),
                $parent = $image.parent();

            if ($image.closest('.cropped-image').length > 0 || $parent.hasClass('image-wrapper')) {
                return;
            }

            if ($parent.prop('tagName') == "TD" && $parent[0].style.width == "") {
                $wrapper.css('width', $image[0].style.width);
                $wrapper.css('height', $image[0].style.height);
            }

            // moved to css, because of IE11 crash on Windows 10 => .image-wrapper img {height:auto!important;float:none!important;}
            //$image.height('auto');
            //$image.css('float', 'none');
            //
            $image.wrap($wrapper);
        });

        $('table', $element).each(function (index, table) {
            var $table = $(table),
                $wrapper = $(tableWrapper).css('float', $table.attr('align'));

            $table.attr('align', 'center');
            $table.wrap($wrapper);
        });

        $(
          ".audio-editor iframe, .video-editor iframe," +
            'iframe[data-media-type="old-editor-video"], iframe[data-media-type="old-editor-audio"]',
          $element
        ).each(function(index, iframe) {
          var $iframe = $(iframe);
          var src = $iframe.attr("src");

          $iframe.attr(
            "src",
            new Url(src)
              .addQueryStringParam("style_variables", getStyles())
              .toString()
          );
        });
    }

    composition.addBindingHandler('elementsWrap');

    function getStyles() {
        return window.LessProcessor && window.LessProcessor.vars ? JSON.stringify({ '@main-color': window.LessProcessor.vars['@main-color'], '@content-body-color': window.LessProcessor.vars['@content-body-color'], '@text-color': window.LessProcessor.vars['@text-color'] }) : undefined;
    }

});