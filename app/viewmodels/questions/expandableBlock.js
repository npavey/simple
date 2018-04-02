define(['knockout'], function (ko) {
    "use strict";

    var viewModel = {
        content: undefined,
        children: undefined,
        isExpanded: ko.observable(),
        activate: activate,
        toggleExpand: toggleExpand
    };

    return viewModel;

    function activate(data) {
        viewModel.content = data.content;
        viewModel.children = data.children;
        viewModel.isExpanded(false)
    }

    function toggleExpand() {
        return viewModel.isExpanded(!viewModel.isExpanded());
    }
});