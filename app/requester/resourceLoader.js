define(['requester/httpWrapper'], function (requester) {
  'use strict';

  class ResourceLoader {
    constructor() {
      this.expires = +new Date();
    }

    set cacheBuster(cacheBuster) {
      if (!cacheBuster) {
        return;
      }
      this.expires = +Date.parse(cacheBuster);
    }

    get cacheBuster() {
      return this.expires;
    }

    getLocalResource({ url, requestOptions }) {
      const { expires } = this;
      const req = Object.assign({ url, useCaching: true, cacheBuster: expires }, requestOptions);
      return requester.get(req);
    }
  }

  return new ResourceLoader();
});
