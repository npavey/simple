define([],
    function () {

        function ContentBlock(spec) {
            this.id = spec.id;
            this.content = null;
            this.children =  spec.children && spec.children.length > 0 ? spec.children : null;
        }

        return ContentBlock;
    }
);