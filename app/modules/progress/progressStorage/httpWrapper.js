define(["jquery"], function($) {
  "use strict";

  return {
    get: get,
    post: post,
    put: put
  };

  function get(url, query, headers, withCredentials) {
    if (withCredentials) {
      return $.ajax(url, {
        data: query,
        headers: headers,
        cache: false,
        xhrFields: {
          withCredentials: true
        },
        crossDomain: true
      });
    } else {
      return $.ajax(url, {
        data: query,
        headers: headers,
        cache: false
      });
    }
  }

  function post(url, data, headers, withCredentials) {
    if (withCredentials) {
      return $.ajax(url, {
        method: "POST",
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
        method: "POST",
        data: JSON.stringify(data),
        headers: headers,
        cache: false
      });
    }
  }

  function put(url, data, headers, withCredentials) {
    if (withCredentials) {
      return $.ajax(url, {
        method: "PUT",
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
        method: "PUT",
        data: JSON.stringify(data),
        headers: headers,
        cache: false
      });
    }
  }
});
