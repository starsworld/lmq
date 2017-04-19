var list = document.querySelector(".slider-list");
var w = list.getBoundingClientRect().width * 1.05;

var scroll = Scroll.create(list);

var events = "swipestart swiping swipeend pinchstart pinch pinchend";
events.split(" ").forEach(function (type) {
    list.addEventListener(type, handleEvents)
});

var c, n, p;
var scaleRate = 1;
var moveDistance = 0;

function pinchScroll(scroll, rate){
    this.scroll = scroll;
    this.rate = rate;
}

pinchScroll.prototye = {
    scrollLeft: function(){
        this.scroll.scrollTo();
    },
    scrollRight: function(){

    },
    scrollPrev: function(){

    },
    scrollNext: function(){

    },
    scrollHere: function(){

    }
}

var isStill = false;
var modifyDistance = 0;
function handleEvents(e) {
    switch(e.type){
        case "swipestart":
        case "swiping":
            if(scroll.isInTransition){
                return;
            }
            scroll.scrollTo(e.detail.x + modifyDistance, 0);
            break;
        case "swipeend":
            if(scroll.isInTransition){
                return;
            }
            scroll.scrollTo(e.detail.x, 0);

            var delta = e.detail.x, s = scaleRate > 1 ? scaleRate : 1, distance = (s - 1) * w / 2;
            //判断有没有触碰到边界
            if(Math.abs(scroll.x) < distance){

            }else if(Math.abs(scroll.x) < distance + w / 4){
                if(delta < 0){
                    scroll.scrollTo(-w * (s / 2 - 0.5), 0, 300);
                    modifyDistance = -distance;
                }else{
                    scroll.scrollTo(w * (s / 2 - 0.5), 0, 300);
                    modifyDistance = distance;
                }
                isStill = true;
            }else{
                if(delta < 0){
                    scroll.scrollTo(-w * (s / 2 + 0.5), 0, 300);
                }else{
                    scroll.scrollTo(w * (s /2 + 0.5), 0, 300);
                }
                isStill = false;
                modifyDistance = 0;
            }

            break;
        case "pinchstart":
            c = document.querySelector(".current");
            n = document.querySelector(".next");
            p = document.querySelector(".prev");
        case "pinch":
            if(scroll.isInTransition){
                return;
            }
            c.style.webkitTransform = "scale(" + e.detail.scale * scaleRate + ", " + e.detail.scale * scaleRate + ")";
            break;
        case "pinchend":
            if(scroll.isInTransition){
                return;
            }
            c.style.webkitTransform = "scale(" + e.detail.scale * scaleRate + ", " + e.detail.scale * scaleRate + ")";
            var scale = e.detail.scale * scaleRate;
            if(scale > 1.0){
                var rate = (scale - 1) * 100 / 2;
                p.style.marginLeft = -rate + "%";
                n.style.marginLeft = rate + "%";
            }
            scaleRate = scale;
    }
}

scroll.on("scrollEnd", function(){
    console.log("scrollEnd");

    if(!isStill){

        var current = document.querySelector(".current");
        var prev = document.querySelector(".prev");
        var next = document.querySelector(".next");
        if(scaleRate !== 1){
            current.style.webkitTransform = "scale(" + 1 + ", " + 1 + ")";
            current.style.marginLeft = "0%";
            prev.style.marginLeft = "0%";
            next.style.marginLeft = "0%";
            scaleRate = 1;
        }

        if(scroll.x < 0){
            current.className = "slider-page prev";
            prev.className = "slider-page next";
            next.className = "slider-page current";
        }else if(scroll.x > 0){
            current.className = "slider-page next";
            prev.className = "slider-page current";
            next.className = "slider-page prev";
        }
        scroll.scrollTo(0, 0);
    }else{
        scroll.isInTransition = false;
    }
})

