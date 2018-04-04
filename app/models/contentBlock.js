define([],
    function () {

        function ContentBlock(spec) {
            this.id = spec.id;
            this.content = null;
            this.children =  spec.children || [];
        }

        return ContentBlock;
    }
);