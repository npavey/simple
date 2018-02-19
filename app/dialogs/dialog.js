define(["plugins/router"], function(router) {
    function Dialog() {
        var that = this;
        this.view = null;
        this.isVisible = ko.observable(false);
        this.callbacks = {};
        this.show = function(callbacks) {
            if (router.isNavigationLocked()) {
                return;
            }

            if (callbacks) that.callbacks = callbacks;

            that.isVisible(true);
        };

        this.hide = function() {
            that.isVisible(false);
            if (_.isFunction(that.callbacks.closed)) {
                that.callbacks.closed();
            }

            that.view &&
                that.view.removeEventListener("keydown", handleKeyDown);
        };

        this.compositionComplete = function(child) {
            that.view = child;
            that.view.addEventListener("keydown", handleKeyDown);

            var focusableState = getFocusableState(that.view);
            if (!focusableState.currentFocusable) {
                focusableState.firstFocusable &&
                    focusableState.firstFocusable.focus();
            }
        };

        function handleKeyDown(e) {
            var KEY_TAB = 9;

            var focusableState = getFocusableState(that.view);

            switch (e.keyCode) {
                case KEY_TAB:
                    if (focusableState.entries.length === 1) {
                        e.preventDefault();
                        break;
                    }
                    if (e.shiftKey) {
                        if (
                            document.activeElement ===
                            focusableState.firstFocusable
                        ) {
                            e.preventDefault();
                            focusableState.lastFocusable.focus();
                        }
                    } else {
                        if (
                            document.activeElement ===
                            focusableState.lastFocusable
                        ) {
                            e.preventDefault();
                            focusableState.firstFocusable.focus();
                        }
                    }
                    break;
                default:
                    break;
            }
        }

        function getFocusableState(view) {
            var result = {};
            result.entries = [].slice.call(
                view.querySelectorAll(
                    "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [contenteditable]"
                )
            );

            result.firstFocusable = result.entries[0];
            result.lastFocusable = result.entries[result.entries.length - 1];

            result.currentFocusable = null;

            for (var i = 0; i < result.entries.length; i++) {
                if (result.entries[i] === document.activeElement) {
                    result.currentFocusable = result.entries[i];
                    break;
                }
            }

            return result;
        }
    }

    return Dialog;
});
