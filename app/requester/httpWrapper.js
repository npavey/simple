define(['jquery'], function ($) {
  'use strict';

  return {
    get: get,
    post: post,
    put: put
  };

  function get({
    url,
    query = {},
    headers = {},
    withCredentials,
    cacheBuster = '',
    useCaching = false,
    contentType,
    dataType
  }) {
    if (withCredentials) {
      return $.ajax(url, {
        data: Object.assign({}, query, { _: cacheBuster }),
        headers: _buildHeaders(headers, useCaching),
        cache: useCaching,
        xhrFields: {
          withCredentials: true
        },
        crossDomain: true,
        dataType,
        contentType
      });
    } else {
      return $.ajax(url, {
        data: Object.assign({}, query, { _: cacheBuster }),
        headers: _buildHeaders(headers, useCaching),
        cache: useCaching,
        dataType,
        contentType
      });
    }
  }

  function post({ url, data = {}, headers = {}, withCredentials }) {
    if (withCredentials) {
      return $.ajax(url, {
        method: 'POST',
        data: JSON.stringify(data),
        headers: headers,
        cache: false,
        xhrFields: {
          withCredentials: true
        },
        crossDomain: true
      });
    } else {
      return $.ajax(url, {
        method: 'POST',
        data: JSON.stringify(data),
        headers: headers,
        cache: false
      });
    }
  }

  function put({ url, data = {}, headers = {}, withCredentials }) {
    if (withCredentials) {
      return $.ajax(url, {
        method: 'PUT',
        data: JSON.stringify(data),
        headers: headers,
        cache: false,
        xhrFields: {
          withCredentials: true
        },
        crossDomain: true
      });
    } else {
      return $.ajax(url, {
        method: 'PUT',
        data: JSON.stringify(data),
        headers: headers,
        cache: false
      });
    }
  }

  function _buildHeaders(headers = {}, cacheBuster = false) {
    const _headers = Object.assign({}, headers);
    const CACHE_EXPIRATION_DATE_IN_SECONDS = 2678400;
    if (cacheBuster) {
      _headers['Cache-Control'] = 'public';
      _headers.Pragma = 'public';
      _headers.Expires = CACHE_EXPIRATION_DATE_IN_SECONDS;
    } else {
      _headers['Cache-Control'] = 'no-cache';
      _headers.Pragma = 'no-cache';
      _headers.Expires = 0;
    }

    return _headers;
  }
});
