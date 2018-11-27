define(function () {
    var imageResizerQueryPattern = /\?width=\d+\&height=\d+&scaleBySmallerSide=\w+/;

    ko.bindingHandlers.containImage = {
        init: function (element, valueAccessor) {
            var $element = $(element);
            var imageProps = valueAccessor();
            var imageUrl = getOriginalImageUrl(imageProps.imageUrl);
            var imageWidth = imageProps.imageWidth;
            var imageHeight = imageProps.imageHeight;

            return getImageSize(imageUrl).then(function(size){
                var resizedImageUrl = imageUrl;
                var backgroundSize = 'initial';
                if(size.width >= imageWidth || size.height >= imageHeight) {
                    resizedImageUrl = getResizedSectionThumbnailUrl(imageUrl, imageWidth, imageHeight);
                    backgroundSize = 'contain';
                }
                if(size.width >= imageWidth && size.height >= imageHeight) {
                    backgroundSize = 'cover';
                }
                $element.css('backgroundSize', backgroundSize);
                $element.css('backgroundImage', 'url(' + resizedImageUrl + ')');
            });
        }
    };

    function getOriginalImageUrl(imageUrl) {
        var originalImage = imageUrl;
        var coincidences = imageResizerQueryPattern.exec(imageUrl);
        if (coincidences && coincidences.length) {
            originalImage = imageUrl.substring(0, coincidences.index);
        }
        return originalImage;
    }

    function getImageSize(imageUrl) {
        var dfd = $.Deferred();
        var img = new Image();
        img.onload = function() {
            dfd.resolve({
                width: this.width,
                height: this.height
            });
        }
        img.onerror = img.onabort = function() {
            dfd.reject('can not load image, url: ' + imageUrl);
        }
        img.src = imageUrl;
        return dfd.promise();
    }

    function getResizedSectionThumbnailUrl(imageUrl, imageWidth, imageHeight) {
        return imageUrl + '?width=' + imageWidth + '&height=' + imageHeight;
    }
});