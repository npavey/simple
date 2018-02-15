define(['underscore'], function (_) {
    'use strict';

    return {
        routes: [{
            route: ['', 'introduction'],
            moduleId: 'viewmodels/introduction',
            title: TranslationPlugin.getTextByKey('[introduction page title]')
        }, {
            route: 'sections',
            moduleId: 'viewmodels/sections',
            title: TranslationPlugin.getTextByKey('[sections page title]'),
            displayTreeOfContent: true
        }, {
            route: 'section/:sectionId/question/:questionId',
            moduleId: 'viewmodels/questions/content',
            title: TranslationPlugin.getTextByKey('[question page title]'),
            displayTreeOfContent: true,
            showExitButton: true,
            rootLinkEnabled: true
        }, {
            route: 'finish',
            moduleId: 'resultPage/resultPage',
            title: TranslationPlugin.getTextByKey('[results page title]'),
            showExitButtonInReviewMode: true
        }, {
            route: '404(/:url)',
            moduleId: 'viewmodels/404',
            title: TranslationPlugin.getTextByKey('[not found page title]')
        }],
        add: add
    };

    function add(routes) {
        var self = this;
        if (_.isObject(routes) && _isRouteCorrect(routes)) {
            this.routes.push(routes);
        } else if (_.isArray(routes)) {
            _.each(routes, function (route) {
                if (_isRouteCorrect(route)) {
                    self.routes.push(route);
                } else {
                    throw 'Route not correct';
                }
            });
        }
    };

    function _isRouteCorrect(route) {
        return _.isObject(route) && route.hasOwnProperty('route') &&
            route.hasOwnProperty('moduleId') && route.hasOwnProperty('title');
    }
});