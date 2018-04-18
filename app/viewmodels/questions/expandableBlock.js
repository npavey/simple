define(['knockout'], function (ko) {
    "use strict";

    function ExpandableBlock() {
        this.content = undefined;
        this.children = undefined;
        this.isExpanded = ko.observable();
    };

    ExpandableBlock.prototype.activate = function(data) {
        this.content = data.content;
        this.children = data.children;
        this.isExpanded(false);
    }

    ExpandableBlock.prototype.toggleExpand = function() {
        return this.isExpanded(!this.isExpanded());
    }

    return ExpandableBlock;
});