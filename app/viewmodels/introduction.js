define(['durandal/app', 'context', 'plugins/router', 'plugins/http', 'templateSettings'],
    function (app, context, router, http, templateSettings) {
        var viewModel = {
            courseTitle: context.course.title,
            content: null,
            copyright: templateSettings.copyright,
            authorContactEmail: context.course.authorContactEmail,
            authorPersonalPhone: context.course.authorPersonalPhone,
            authorShortBio: context.course.authorShortBio,
            createdBy: context.course.createdBy,
            allowAuthorsBio: templateSettings.allowAuthorsBio,
            isNavigationLocked: router.isNavigationLocked()
        }

        viewModel.canActivate = function () {
            if (context.course.hasIntroductionContent == false && !viewModel.allowAuthorsBio) {
                return { redirect: '#sections' };
            }
            return true;
        };

        viewModel.activate = function () {
            return Q.fcall(function () {
                return http.get('content/content.html').then(function (response) {
                    viewModel.content = response;
                }).fail(function () {
                    viewModel.content = '';
                });
            });
        };

        viewModel.startCourse = function () {
            if (router.isNavigationLocked()) {
                return;
            }
            router.navigate('sections');
        }

        return viewModel;
    }
);