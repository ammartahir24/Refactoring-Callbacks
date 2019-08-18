"use strict";

if (!com) {
    var com = {};
    if (!com.modestmaps) {
        com.modestmaps = {};
    }
}

com.modestmaps.CabFollower = function(i, s, t) {
    this.coord = i.locationCoordinate(s);
    this.dimensions = new com.modestmaps.Point(20, 20);
    this.offset = new com.modestmaps.Point(this.dimensions.x / 2, -this.dimensions.y / 2);
    var e = this;
    var n = function i(s, t) {
        return e.draw(s);
    };
    i.addCallback("panned", n);
    i.addCallback("zoomed", n);
    i.addCallback("centered", n);
    i.addCallback("extentset", n);
    this.div = document.createElement("div");
    this.div.style.position = "absolute";
    this.div.style.width = this.dimensions.x + "px";
    this.div.style.height = this.dimensions.y + "px";
    var o = document.createElement("canvas");
    this.div.appendChild(o);
    if (typeof G_vmlCanvasManager !== "undefined") o = G_vmlCanvasManager.initElement(o);
    o.style.position = "absolute";
    o.style.left = "0px";
    o.style.top = "0px";
    o.width = this.dimensions.x;
    o.height = this.dimensions.y;
    var d = o.getContext("2d");
    d.lineWidth = 3;
    d.strokeStyle = "rgba(255,255,0,1)";
    d.fillStyle = "rgba(0,0,0,1)";
    d.beginPath();
    d.arc(this.dimensions.x / 2, this.dimensions.x / 2, -2 + this.dimensions.x / 2, 0, Math.PI * 2, true);
    d.closePath();
    d.fill();
    d.stroke();
    i.parent.appendChild(this.div);
    this.draw(i);
};

com.modestmaps.CabFollower.prototype = {
    div: null,
    coord: null,
    offset: null,
    dimensions: null,
    margin: null,
    draw: function i(s) {
        try {
            var t = s.coordinatePoint(this.coord);
        } catch (i) {
            return;
        }
        if (t.x + this.dimensions.x + this.offset.x < 0) {
            this.div.style.display = "none";
        } else if (t.y + this.dimensions.y + this.offset.y < 0) {
            this.div.style.display = "none";
        } else if (t.x + this.offset.x > s.dimensions.x) {
            this.div.style.display = "none";
        } else if (t.y + this.offset.y > s.dimensions.y) {
            this.div.style.display = "none";
        } else {
            this.div.style.display = "block";
            this.div.style.left = t.x + this.offset.x + "px";
            this.div.style.top = t.y + this.offset.y + "px";
        }
    }
};
