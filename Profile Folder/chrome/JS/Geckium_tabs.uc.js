// ==UserScript==
// @name            noTabScroll
// @author          blackle, AngelBruni
// @include         main
// ==/UserScript==

(function() {
    const onUnderflow = window.customElements.get('arrowscrollbox').prototype.on_underflow;
    window.customElements.get('arrowscrollbox').prototype.on_underflow = function(e) {
        if (this.id === "tabbrowser-arrowscrollbox") {
            e.preventDefault();
            return;
        }
        onUnderflow.call(this, e);
    };

    const onOverflow = window.customElements.get('arrowscrollbox').prototype.on_overflow;
    window.customElements.get('arrowscrollbox').prototype.on_overflow = function(e) {
        if (this.id === "tabbrowser-arrowscrollbox") {
            e.preventDefault();
            return;
        }
        onOverflow.call(this, e);
    };

    window.customElements.get('tabbrowser-tabs').prototype._initializeArrowScrollbox = function() {
	return;
    };
})();
