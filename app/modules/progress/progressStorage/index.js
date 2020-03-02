define([
  "context",
  "../constants",
  "./httpWrapper",
  "./urlProvider",
  "./auth",
  "helpers/requestResender",
  "helpers/idToUuid"
], function(
  context,
  constants,
  httpWrapper,
  urlProvider,
  auth,
  requestResender,
  idToUuid
) {
  "use strict";

  function ProgressStorageProvider(courseId, templateId) {
    var _progress = null;
    var self = this;
    this.courseId = courseId;
    this.templateId = templateId;

    this.progressKey = constants.progressKey + this.courseId + this.templateId;
    this.resultKey = constants.resultKey + this.courseId + this.templateId;

    this.getCourseStatus = function() {
      if (context.course.getStatus() === "completed") {
        return "PASSED";
      } else if (context.course.getStatus() === "failed") {
        return "FAILED";
      }
      return "IN_PROGRESS";
    };

    this.getProgress = function() {
      return _progress;
    };

    this.setProgress = function(progress) {
      _progress = progress;
    };

    this.getProgressFromServer = function() {
      if (!auth.authenticated) {
        return false;
      }
      return httpWrapper
        .get(
          urlProvider.learnServiceUrl +
            constants.learnerCoursesApi +
            idToUuid(this.courseId) +
            "/attempts/last",
          {
            templateId: this.templateId
          },
          { Authorization: "Bearer " + auth.getToken() },
          false
        )
        .then(function(response) {
          _progress = JSON.parse(response.jsonProgress);
          return response.jsonProgress;
        })
        .fail(function(fail) {
          console.error("Get progress from server fails with error: ", fail);
          return fail;
        });
    };

    this.startNewAttempt = function() {
      return httpWrapper
        .post(
          urlProvider.learnServiceUrl +
            constants.learnerCoursesApi +
            idToUuid(self.courseId) +
            "/attempts",
          {
            templateId: self.templateId,
            jsonProgress: "{}",
            score: 0,
            status: "IN_PROGRESS",
            courseUrl: urlProvider.courseLink
          },
          {
            "Content-Type": constants.contentTypeJson,
            Authorization: "Bearer " + auth.getToken()
          },
          false
        )
        .then(function(newProgress) {
          console.log("New attempt starts");
          return newProgress.jsonProgress;
        });
    };

    this.saveProgress = function(progress) {
      var requestOptions = {
        url:
          urlProvider.learnServiceUrl +
          constants.learnerCoursesApi +
          idToUuid(this.courseId) +
          "/attempts/last" +
          "?templateId=" +
          this.templateId,

        method: "PUT",
        data: JSON.stringify({
          jsonProgress: progress ? JSON.stringify(progress) : "{}",
          score: context.course.score(),
          status: this.getCourseStatus()
        }),
        headers: {
          "Content-Type": constants.contentTypeJson,
          Authorization: "Bearer " + auth.getToken()
        },
        cache: false
      };

      return requestResender
        .send(requestOptions)
        .then(function(response) {
          return response;
        })
        .fail(function(failedResponse) {
          if (failedResponse.status === 401) {
            return auth.signout();
          }

          console.error("Save progress failed with error: ", failedResponse);
          return false;
        });
    };

    this.saveResults = function(getScore, getStatus, errorMessage) {
      //TODO: now we use only localStorage for save results
      var result = {
        score: context.course.score(),
        status: context.course.getStatus()
      };

      try {
        localStorage.setItem(this.resultKey, JSON.stringify(result));
      } catch (e) {
        console.error(
          TranslationPlugin.getTextByKey("[not enough memory to save progress]")
        );
        return false;
      }
      return true;
    };

    this.removeProgress = function(callback) {
      return httpWrapper.post(
        urlProvider.learnServiceUrl +
          constants.learnerCoursesApi +
          idToUuid(this.courseId) +
          "/attempts",
        {
          templateId: this.templateId,
          jsonProgress: "{}",
          score: 0,
          status: "IN_PROGRESS",
          courseUrl: urlProvider.courseLink
        },
        {
          "Content-Type": constants.contentTypeJson,
          Authorization: "Bearer " + auth.getToken()
        },
        false
      );
    };
  }

  return ProgressStorageProvider;
});
