"use strict";

// https://github.com/pixijs/pixi.js/blob/33193d8532d3c9aa563a4a38ae32e18b0b026e79/packages/mesh-extras/test/SimplePlane.js
var _require = require('../'),
    SimplePlane = _require.SimplePlane;

var _require2 = require('@pixi/utils'),
    skipHello = _require2.skipHello;

var _require3 = require('@pixi/loaders'),
    Loader = _require3.Loader;

var _require4 = require('@pixi/math'),
    Point = _require4.Point;

var _require5 = require('@pixi/core'),
    RenderTexture = _require5.RenderTexture,
    Texture = _require5.Texture;

skipHello(); // TODO: fix with webglrenderer

describe('PIXI.SimplePlane', function () {
  it('should create a plane from an external image', function (done) {
    var loader = new Loader();
    loader.add('testBitmap', "file://" + __dirname + "/resources/bitmap-1.png").load(function (loader, resources) {
      var plane = new SimplePlane(resources.testBitmap.texture, 100, 100);
      expect(plane.geometry.segWidth).to.equal(100);
      expect(plane.geometry.segHeight).to.equal(100);
      done();
    });
  });
  it('should create a new empty textured SimplePlane', function () {
    var plane = new SimplePlane(Texture.EMPTY, 100, 100);
    expect(plane.geometry.segWidth).to.equal(100);
    expect(plane.geometry.segHeight).to.equal(100);
  });
  describe('containsPoint', function () {
    it('should return true when point inside', function () {
      var point = new Point(10, 10);
      var texture = new RenderTexture.create(20, 30);
      var plane = new SimplePlane(texture, 100, 100);
      expect(plane.containsPoint(point)).to.be.true;
    });
    it('should return false when point outside', function () {
      var point = new Point(100, 100);
      var texture = new RenderTexture.create(20, 30);
      var plane = new SimplePlane(texture, 100, 100);
      expect(plane.containsPoint(point)).to.be.false;
    });
  });
});