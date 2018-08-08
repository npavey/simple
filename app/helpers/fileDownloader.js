define(['download', 'jquery'],
    function (download, $) {
        'use strict';

        function downloadFile(url, filename) {
            return fetch(url)
            .then(function(response) {
                if(response.status !== 200) {
                    return response.json().then(function (error) {
                        if(error && error.message) {
                            throw new Error(error.message);
                        }
                        throw new Error();
                    });
                }

                return response.blob();
            })
            .then(function(blob) {
                download(blob, filename, blob.type);
            });
        }

        return {
            downloadFile: downloadFile
        };
    });