define(['durandal/app', 'context', 'plugins/router', 'requester/resourceLoader', 'templateSettings'], function (
  app,
  context,
  router,
  resourceLoader,
  templateSettings
) {
  var viewModel = {
    courseTitle: context.course.title,
    introduction: [],
    copyright: templateSettings.copyright,
    authorContactEmail: context.course.authorContactEmail,
    authorPersonalPhone: context.course.authorPersonalPhone,
    authorShortBio: context.course.authorShortBio,
    createdBy: context.course.createdBy,
    authorAvatarUrl: context.course.authorAvatarUrl,
    allowAuthorsBio: templateSettings.allowAuthorsBio,
    isNavigationLocked: router.isNavigationLocked()
  };

  viewModel.canActivate = function () {
    if (!context.course.hasIntroductionContent && !viewModel.allowAuthorsBio) {
      return { redirect: '#sections' };
    }
    return true;
  };

  var dfd = Q.defer();

  viewModel.activate = function () {
    var promises = [];

    context.course.hasIntroductionContent &&
      context.course.introductions.forEach(function (introductionItem, index) {
        viewModel.introduction[index] = introductionItem;

        if (introductionItem.children && introductionItem.children.length) {
          introductionItem.children.forEach(function (child, childIndex) {
            return promises.push(
              resourceLoader
                .getLocalResource({
                  url: 'content/introduction/' + child.id + '.html'
                })
                .then(function (response) {
                  viewModel.introduction[index].children[childIndex].content = response;
                })
                .fail(function () {
                  viewModel.introduction = [];
                })
            );
          });
        }

        return promises.push(
          resourceLoader
            .getLocalResource({
              url: 'content/introduction/' + introductionItem.id + '.html'
            })
            .then(function (response) {
              viewModel.introduction[index].content = response;
            })
            .fail(function () {
              viewModel.introduction = [];
            })
        );
      });

    Q.allSettled(promises)
      .then(function () {
        dfd.resolve();
      })
      ['catch'](function (reason) {
        dfd.reject(reason);
      });

    return dfd.promise;
  };

  viewModel.startCourse = function () {
    if (router.isNavigationLocked()) {
      return;
    }
    router.navigate('sections');
  };

  return viewModel;
});
