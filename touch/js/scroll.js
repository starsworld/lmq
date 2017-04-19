(function (window, document, Math){

var utils = (function () {
    var me = {};

    me.ease = {
        circular: {
            style: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        }
    };

    return me;
})();

function Scroll(el, options){
    this.scroller = typeof el == "string" ? document.querySelector(el) : el;
    this.scrollerStyle = this.scroller.style;

    this.translateZ = "translateZ(0)";

    this.x = 0;
    this.y = 0;
    this._events = {};
    this._initEvents();
}

Scroll.prototype = {
    version: "0.1",

    _initEvents: function () {
        this.scroller.addEventListener("transitionend", this)
    },

    scrollTo: function (x, y, time, easing) {
        easing = easing || utils.ease.circular;

        this.isInTransition = time > 0;
        var transitionType = easing.style;
        if(!time || transitionType){
            this._transitionTimingFunction(easing.style);
            this._transitionTime(time);
            this._translate(x, y);
        }
    },

    _transitionTimingFunction: function (easing) {
        this.scrollerStyle["transitionTimingFunction"] = easing;
    },
    
    _transitionTime: function (time) {
        time = time || 0;
        this.scrollerStyle["transitionDuration"] = time + "ms";
    },

    _translate: function (x, y) {
        this.scrollerStyle["transform"] = "translate(" + x + "px, " + y + "px)" + this.translateZ;

        this.x = x;
        this.y = y;
    },

    handleEvent: function (e) {
        switch (e.type){
            case "transitionend":
                this._transitionEnd(e);
                break;
        }
    },

    _transitionEnd: function (e) {
        if(e.target != this.scroller || !this.isInTransition){
            return;
        }
        this._transitionTime();
        this.inInTransition = false;
        this._execEvent("scrollEnd");
    },

    _execEvent: function (type) {
        if(!this._events[type]){
            return;
        }
        var i = 0,
            len = this._events[type].length;
        if(!len){
            return;
        }
        for(; i < len; i++){
            this._events[type][i].apply(this, [].slice.call(arguments, 1));
        }
    },
    
    on: function (type, fn) {
        if(!this._events[type]){
            this._events[type] = [];
        }
        this._events[type].push(fn);
    }
};

Scroll.create = function (el, options) {
    return new Scroll(el, options);
};

if(typeof module != "undefined" && module.exports){
    module.exports = Scroll;
}else if(typeof define == "function" && define.amd){
    define(function () {
        return Scroll;
    })
}else{
    window.Scroll = Scroll;
}
})(window, document, Math);