"use strict";

if (!com) {
    var com = {};
    if (!com.modestmaps) {
        com.modestmaps = {};
    }
}

(function(m) {
    m.Follower = function(i, s, t) {
        this.coord = i.locationCoordinate(s);
        this.offset = new m.Point(0, 0);
        this.dimensions = new m.Point(150, 150);
        this.margin = new m.Point(10, 10);
        this.offset = new m.Point(0, -this.dimensions.y);
        var e = this;
        var n = function i(s, t) {
            return e.draw(s);
        };
        i.addCallback("drawn", n);
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
        o.width = this.dimensions.x * 2;
        o.height = this.dimensions.y;
        var d = o.getContext("2d");
        d.transform(1, 0, -.5, .5, 75, this.dimensions.y / 2);
        d.fillStyle = "rgba(0,0,0,0.5)";
        this.drawBubblePath(d);
        d.fill();
        var l = document.createElement("canvas");
        this.div.appendChild(l);
        if (typeof G_vmlCanvasManager !== "undefined") l = G_vmlCanvasManager.initElement(l);
        l.style.position = "absolute";
        l.style.left = "0px";
        l.style.top = "0px";
        l.width = this.dimensions.x;
        l.height = this.dimensions.y;
        var h = l.getContext("2d");
        h.strokeStyle = "black";
        h.fillStyle = "white";
        this.drawBubblePath(h);
        h.fill();
        h.stroke();
        var a = document.createElement("div");
        a.style.position = "absolute";
        a.style.left = "0px";
        a.style.top = "0px";
        a.style.overflow = "hidden";
        a.style.width = this.dimensions.x - this.margin.x + "px";
        a.style.height = this.dimensions.y - this.margin.y - 25 + "px";
        a.style.padding = this.margin.y + "px " + this.margin.x + "px " + this.margin.y + "px " + this.margin.x + "px";
        a.innerHTML = t;
        this.div.appendChild(a);
        m.addEvent(a, "mousedown", function(i) {
            if (!i) i = window.event;
            return m.cancelEvent(i);
        });
        i.parent.appendChild(this.div);
        this.draw(i);
    };
    m.Follower.prototype = {
        div: null,
        coord: null,
        offset: null,
        dimensions: null,
        margin: null,
        draw: function i(s) {
            try {
                var t = s.coordinatePoint(this.coord);
            } catch (i) {
                console.error(i);
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
                m.moveElement(this.div, {
                    x: Math.round(t.x + this.offset.x),
                    y: Math.round(t.y + this.offset.y),
                    scale: 1,
                    width: this.dimensions.x,
                    height: this.dimensions.y
                });
            }
        },
        drawBubblePath: function i(s) {
            s.beginPath();
            s.moveTo(10, this.dimensions.y);
            s.lineTo(35, this.dimensions.y - 25);
            s.lineTo(this.dimensions.x - 10, this.dimensions.y - 25);
            s.quadraticCurveTo(this.dimensions.x, this.dimensions.y - 25, this.dimensions.x, this.dimensions.y - 35);
            s.lineTo(this.dimensions.x, 10);
            s.quadraticCurveTo(this.dimensions.x, 0, this.dimensions.x - 10, 0);
            s.lineTo(10, 0);
            s.quadraticCurveTo(0, 0, 0, 10);
            s.lineTo(0, this.dimensions.y - 35);
            s.quadraticCurveTo(0, this.dimensions.y - 25, 10, this.dimensions.y - 25);
            s.lineTo(15, this.dimensions.y - 25);
            s.moveTo(10, this.dimensions.y);
        }
    };
})(com.modestmaps);
