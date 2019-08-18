"use strict";

function Block(t, i, e, s, h) {
    this.settled = h === undefined ? 0 : 1;
    this.height = settings.blockHeight;
    this.fallingLane = t;
    this.checked = 0;
    this.angle = 90 - (30 + 60 * t);
    this.angularVelocity = 0;
    this.targetAngle = this.angle;
    this.color = i;
    this.deleted = 0;
    this.removed = 0;
    this.tint = 0;
    this.opacity = 1;
    this.initializing = 1;
    this.ict = MainHex.ct;
    this.iter = e;
    this.initLen = settings.creationDt;
    this.attachedLane = 0;
    this.distFromHex = s || settings.startDist * settings.scale;
    this.incrementOpacity = function() {
        if (this.deleted) {
            if (this.opacity >= .925) {
                var t = this.attachedLane - MainHex.position;
                t = MainHex.sides - t;
                while (t < 0) {
                    t += MainHex.sides;
                }
                t %= MainHex.sides;
                MainHex.shakes.push({
                    lane: t,
                    magnitude: 3 * (window.devicePixelRatio ? window.devicePixelRatio : 1) * settings.scale
                });
            }
            this.opacity = this.opacity - .075 * MainHex.dt;
            if (this.opacity <= 0) {
                this.opacity = 0;
                this.deleted = 2;
                if (gameState == 1 || gameState == 0) {
                    localStorage.setItem("saveState", exportSaveState());
                }
            }
        }
    };
    this.getIndex = function() {
        var t = MainHex.blocks[this.attachedLane];
        for (var i = 0; i < t.length; i++) {
            if (t[i] == this) {
                return i;
            }
        }
    };
    this.draw = function(t, i) {
        this.height = settings.blockHeight;
        if (Math.abs(settings.scale - settings.prevScale) > 1e-9) {
            this.distFromHex *= settings.scale / settings.prevScale;
        }
        this.incrementOpacity();
        if (t === undefined) t = false;
        if (this.angle > this.targetAngle) {
            this.angularVelocity -= angularVelocityConst * MainHex.dt;
        } else if (this.angle < this.targetAngle) {
            this.angularVelocity += angularVelocityConst * MainHex.dt;
        }
        if (Math.abs(this.angle - this.targetAngle + this.angularVelocity) <= Math.abs(this.angularVelocity)) {
            this.angle = this.targetAngle;
            this.angularVelocity = 0;
        } else {
            this.angle += this.angularVelocity;
        }
        this.width = 2 * this.distFromHex / Math.sqrt(3);
        this.widthWide = 2 * (this.distFromHex + this.height) / Math.sqrt(3);
        var e;
        var s;
        var h;
        var a;
        if (this.initializing) {
            var n = (MainHex.ct - this.ict) / this.initLen;
            if (n > 1) {
                n = 1;
            }
            e = rotatePoint(-this.width / 2 * n, this.height / 2, this.angle);
            s = rotatePoint(this.width / 2 * n, this.height / 2, this.angle);
            h = rotatePoint(this.widthWide / 2 * n, -this.height / 2, this.angle);
            a = rotatePoint(-this.widthWide / 2 * n, -this.height / 2, this.angle);
            if (MainHex.ct - this.ict >= this.initLen) {
                this.initializing = 0;
            }
        } else {
            e = rotatePoint(-this.width / 2, this.height / 2, this.angle);
            s = rotatePoint(this.width / 2, this.height / 2, this.angle);
            h = rotatePoint(this.widthWide / 2, -this.height / 2, this.angle);
            a = rotatePoint(-this.widthWide / 2, -this.height / 2, this.angle);
        }
        if (this.deleted) {
            ctx.fillStyle = "#FFF";
        } else if (gameState === 0) {
            if (this.color.charAt(0) == "r") {
                ctx.fillStyle = rgbColorsToTintedColors[this.color];
            } else {
                ctx.fillStyle = hexColorsToTintedColors[this.color];
            }
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.globalAlpha = this.opacity;
        var l = trueCanvas.width / 2 + Math.sin(this.angle * (Math.PI / 180)) * (this.distFromHex + this.height / 2) + gdx;
        var o = trueCanvas.height / 2 - Math.cos(this.angle * (Math.PI / 180)) * (this.distFromHex + this.height / 2) + gdy;
        ctx.beginPath();
        ctx.moveTo(l + e.x, o + e.y);
        ctx.lineTo(l + s.x, o + s.y);
        ctx.lineTo(l + h.x, o + h.y);
        ctx.lineTo(l + a.x, o + a.y);
        ctx.closePath();
        ctx.fill();
        if (this.tint) {
            if (this.opacity < 1) {
                if (gameState == 1 || gameState == 0) {
                    localStorage.setItem("saveState", exportSaveState());
                }
                this.iter = 2.25;
                this.tint = 0;
            }
            ctx.fillStyle = "#FFF";
            ctx.globalAlpha = this.tint;
            ctx.beginPath();
            ctx.moveTo(l + e.x, o + e.y);
            ctx.lineTo(l + s.x, o + s.y);
            ctx.lineTo(l + h.x, o + h.y);
            ctx.lineTo(l + a.x, o + a.y);
            ctx.lineTo(l + e.x, o + e.y);
            ctx.closePath();
            ctx.fill();
            this.tint -= .02 * MainHex.dt;
            if (this.tint < 0) {
                this.tint = 0;
            }
        }
        ctx.globalAlpha = 1;
    };
}

function findCenterOfBlocks(t) {
    var i = 0;
    var e = 0;
    for (var s = 0; s < t.length; s++) {
        i += t[s].distFromHex;
        var h = t[s].angle;
        while (h < 0) {
            h += 360;
        }
        e += h % 360;
    }
    i /= t.length;
    e /= t.length;
    return {
        x: trueCanvas.width / 2 + Math.cos(e * (Math.PI / 180)) * i,
        y: trueCanvas.height / 2 + Math.sin(e * (Math.PI / 180)) * i
    };
}
