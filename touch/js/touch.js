"use strict";
(function (root, factory) {
    if(typeof define === "function" && (define.amd || define.cmd)){
        define(factory);
    }else{
        root.touch = factory();
    }
}(this, function () {

var utils = {};

utils.hasTouch = ("ontouchstart" in window);

utils.simpleClone = function (obj) {
    return Object.create(obj);
};

utils.getPosOfEvent = function (ev) {
    if(this.hasTouch){
        var pos = [];
        var src = null;
        for(var i = 0; i < ev.touches.length; i++){
            src = ev.touches[i];
            pos.push({
                x: src.pageX,
                y: src.pageY
            });
        }
        return pos;
    }else{
        return [{
            x: ev.pageX,
            y: ev.pageY
        }];
    }
};

utils.getDistance = function (pos1, pos2) {
    var x = pos2.x - pos1.x,
        y = pos2.y - pos1.y;
    return Math.sqrt((x * x) + ( y * y));
};

utils.getFingers = function (ev) {
    return ev.touches ? ev.touches.length : 1;
};

utils.calScale = function (start, move) {
    if(start.length >= 2 && move.length >= 2){
        var disStart = this.getDistance(start[1], start[0]);
        var disEnd = this.getDistance(move[1], move[0]);

        return disEnd / disStart;
    }
    return 1;
};

utils.reset = function () {
    __touchStart = __startSwipe = __startPinch = __startDrag = false;
    pos = {};
};

utils.isTouchMove = function (ev) {
    return (ev.type === "touchmove" || ev.type === "mousemove");
};

utils.isTouchEnd = function (ev) {
    return (ev.type === "touchend" || ev.type === "mouseup" || ev.type === "touchcancel");
};

var __touchStart = false;
var __startSwipe = false;
var __startPinch = false;
var __startDrag = false;
var __startTime = 0;
var __scaleLastRate = 1;
var pos = {
    start: null,
    move: null,
    end: null
};
var __startOffset = {};

var config = {
    tap: true,
    swipe: true,
    swipeTime: 300,
    swipeMinDistance: 18,
    drag: true,
    pinch: true,
    minScaleRate: 1,
    maxScaleRate: 2
};

var engine = {
    trigger: function (el, evt, detail) {
        detail = detail || {};
        var e, opt = {
            bubbles: true,
            cancelable: true,
            detail: detail
        };
        try{
            if(typeof CustomEvent !== "undefined"){
                e = new CustomEvent(evt, opt);
                if(el){
                    el.dispatchEvent(e);
                }
            }else{
                e = document.createEvent("CustomEvent");
                e.initCustomEvent(evt, true, true, detail);
                if(el){
                    el.dispatchEvent(e);
                }
            }
        }catch(ex){

        }
    }
};

var eventList = {
    TOUCH_START: "touchstart",
    TOUCH_MOVE: "touchmove",
    TOUCH_END: "touchend",
    TOUCH_CANCEL: "touchcancel",
    MOUSE_DOWN: "mousedown",
    MOUSE_MOVE: "mousemove",
    MOUSE_UP: "mouseup",
    PINCH_START: "pinchstart",
    PINCH_END: "pinchend",
    PINCH: "pinch",
    PINCH_IN: "pinchin",
    PINCH_OUT: "pinchout",
    SWIPE_START: "swipestart",
    SWIPING: "swiping",
    SWIPE_END: "swipeend",
    SWIPE_LEFT: "swipleft",
    SWIPE_RIGHT: "swiperight",
    SWIPE_UP: "swipeup",
    SWIPE_DOWN: "swipedown",
    SWIPE: "swipe",
    DRAG: "drag",
    DRAG_START: "dragstart",
    DRAG_END: "dragend"
};

var gestures = {
    pinch: function (ev) {
        var el = ev.target;
        if(config.pinch){
            if(!__touchStart) return;
            if(utils.getFingers(ev) < 2){
                if(!utils.isTouchEnd(ev)) return; //这里应该也是应对两根手指 突然一根离开屏幕的情况
            }
            var scale = utils.calScale(pos.start, pos.move);  //todo
            var eventObj = {
                type: "",
                originEvent: ev,
                scale: scale,
                fingersCount: utils.getFingers(ev)
            };
            if(scale < config.minScaleRate || scale > config.maxScaleRate){
                //return;
            }
            if(!__startPinch){
                __startPinch = true;
                eventObj.fingerStatus = "start";
                engine.trigger(el, eventList.PINCH_START, eventObj);
            }else if(utils.isTouchMove(ev)){
                eventObj.fingerStatus = "move";
                engine.trigger(el, eventList.PINCH, eventObj);
            }else if(utils.isTouchEnd(ev)){
                eventObj.fingerStatus = "end";
                engine.trigger(el, eventList.PINCH_END, eventObj);
                utils.reset();
            }

            if(Math.abs(1 - scale) > config.minScaleRate){
                var scaleEv = utils.simpleClone(eventObj);

                var scaleParam = 0.00000000001;
                if(scale > __scaleLastRate){
                    __scaleLastRate = scale - scaleParam;
                    engine.trigger(el, eventList.PINCH_OUT, scaleEv, false);
                }else if(scale < __scaleLastRate){
                    __scaleLastRate = scale + scaleParam;
                    engine.trigger(el, eventList.PINCH_IN, scaleEv, false);
                }

                if(utils.isTouchEnd(ev)){
                    __scaleLastRate = 1;
                }
            }
        }
    },
    swipe: function (ev) {
        var el = ev.target;
        if(!__touchStart || !pos.move || utils.getFingers(ev) > 1){
            return;
        }

        var now = Date.now();
        var touchTime = now - __startTime;
        var distance = utils.getDistance(pos.start[0], pos.move[0]);
        var position = {
            x: pos.move[0].x - __startOffset.left,
            y: pos.move[0].y - __startOffset.top
        };
        var eventObj = {
            type: eventList.SWIPE,
            originEvent: ev,
            position: position,
            distance: distance,
            distanceX: pos.move[0].x - pos.start[0].x,
            distanceY: pos.move[0].y - pos.start[0].y,
            x: pos.move[0].x - pos.start[0].x,
            y: pos.move[0].y - pos.start[0].y,
            duration: touchTime
        };

        if(config.swipe){
            if(!__startSwipe){
                eventObj.fingerStatus = eventObj.swipe = "start";
                __startSwipe = true;
                engine.trigger(el, eventList.SWIPE_START, eventObj);
            }else if(utils.isTouchMove(ev)){
                eventObj.fingerStatus = eventObj.swipe = "move";
                engine.trigger(el, eventList.SWIPING, eventObj);
            }else if(utils.isTouchEnd(ev) || ev.type === "mouseout"){
                eventObj.fingerStatus = eventObj.swipe = "end";
                engine.trigger(el, eventList.SWIPE_END, eventObj);
            }
        }
    }
};

function handleEvents(ev) {
    ev.preventDefault(); //这句话很重要
    var el = ev.target;
    switch(ev.type){
        case "touchstart":
        case "mousedown":
            __touchStart = true;

            if(!pos.start || pos.start.length < 2){
                pos.start = utils.getPosOfEvent(ev); //todo
            }

            __startTime = Date.now();

            __startOffset = {};
            var box = el.getBoundingClientRect();
            var doc = document.documentElement;
            __startOffset = {
                top: box.top + (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0),
                left: box.left + (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0)
            }
            break;
        case "mousemove":
        case "touchmove":
            if(!__touchStart || !pos.start) return; //todo
            pos.move = utils.getPosOfEvent(ev);
            if(utils.getFingers(ev) >= 2){
                gestures.pinch(ev);
            }else{
                gestures.swipe(ev);
            }
            break;
        case "touchend":
        case "touchcancel":
        case "mouseout":
        case "mouseup":
            if(!__touchStart) return;
            if(__startPinch){
                gestures.pinch(ev);
            }else if(__startSwipe){
                gestures.swipe(ev)
            }

            utils.reset();
            if(ev.touches && ev.touches.length === 1){
                __touchStart = true; //这里的意思似乎是说当两个手指中的一个离开屏幕时会触发touchend或touchcancel事件
            }
            break;
    }
}


function init(){
    var mouseEvents = "mouseup mousedown mouseout mousemove",
        touchEvents = "touchstart touchend touchmove touchcancel";
    var bindEvents = utils.hasTouch ? touchEvents : mouseEvents;
    bindEvents.split(" ").forEach(function (evt) {
        document.addEventListener(evt, handleEvents, false);
    })
}
init();
}))