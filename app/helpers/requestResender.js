define(["q", "jquery"], function(Q, $) {
  var constants = {
    sendResultAttemptsTimeout: 10000,
    sendResultAttemptsCount: 10,
    serverProblemStatus: 500,
    noInternetConnectionStatus: 0
  };

  function send(requestOptions, failedCallback, defer, attemptNumber) {
    if (typeof defer === "undefined") {
      defer = Q.defer();
    }

    if (typeof attemptNumber === "undefined") {
      attemptNumber = 0;
    }

    $.ajax(requestOptions)
      .done(function() {
        defer.resolve();
      })
      .fail(function(response, textStatus, error) {
        if (
          attemptNumber >= constants.sendResultAttemptsCount ||
          (response.status < constants.serverProblemStatus &&
            response.status !== constants.noInternetConnectionStatus)
        ) {
          return defer.reject(
            failedCallback && failedCallback(response, textStatus, error)
          );
        }

        setTimeout(function() {
          send(requestOptions, failedCallback, defer, ++attemptNumber);
        }, constants.sendResultAttemptsTimeout);
      });

    return defer.promise;
  }

  return {
    send: send
  };
});
