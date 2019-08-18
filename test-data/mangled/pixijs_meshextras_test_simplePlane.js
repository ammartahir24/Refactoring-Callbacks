"use strict";

var _require = require("../"), SimplePlane = _require.SimplePlane;

var _require2 = require("@pixi/utils"), skipHello = _require2.skipHello;

var _require3 = require("@pixi/loaders"), Loader = _require3.Loader;

var _require4 = require("@pixi/math"), Point = _require4.Point;

var _require5 = require("@pixi/core"), RenderTexture = _require5.RenderTexture, Texture = _require5.Texture;

skipHello();

describe("PIXI.SimplePlane", function() {
    it("should create a plane from an external image", function(i) {
        var e = new Loader();
        e.add("testBitmap", "file://" + __dirname + "/resources/bitmap-1.png").load(function(e, r) {
            var t = new SimplePlane(r.testBitmap.texture, 100, 100);
            expect(t.geometry.segWidth).to.equal(100);
            expect(t.geometry.segHeight).to.equal(100);
            i();
        });
    });
    it("should create a new empty textured SimplePlane", function() {
        var e = new SimplePlane(Texture.EMPTY, 100, 100);
        expect(e.geometry.segWidth).to.equal(100);
        expect(e.geometry.segHeight).to.equal(100);
    });
    describe("containsPoint", function() {
        it("should return true when point inside", function() {
            var e = new Point(10, 10);
            var r = new RenderTexture.create(20, 30);
            var t = new SimplePlane(r, 100, 100);
            expect(t.containsPoint(e)).to.be.true;
        });
        it("should return false when point outside", function() {
            var e = new Point(100, 100);
            var r = new RenderTexture.create(20, 30);
            var t = new SimplePlane(r, 100, 100);
            expect(t.containsPoint(e)).to.be.false;
        });
    });
});
