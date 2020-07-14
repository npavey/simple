define(function() {
    return function Url(url) {
        url = url || '';

        var that = this;
        that.toString = function() {
          return url;
        };
        that.addQueryStringParam = function (key, value) {
            value = encodeURIComponent(value);

            var regex = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            if (url.match(regex)) {
                url = url.replace(regex, '$1' + key + '=' + value + '$2');
            } else {
                url = url + separator + key + '=' + value;
            }

            return that;
        }
    };
});
