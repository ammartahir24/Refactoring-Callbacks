"use strict";

var path = require("path");

var _require = require("@pixi/loaders"), Loader = _require.Loader, LoaderResource = _require.LoaderResource;

var _require2 = require("@pixi/core"), Texture = _require2.Texture, BaseTexture = _require2.BaseTexture;

var _require3 = require("../"), SpritesheetLoader = _require3.SpritesheetLoader, Spritesheet = _require3.Spritesheet;

describe("PIXI.SpritesheetLoader", function() {});

function createMockResource(e, t) {
    var r = "" + Math.floor(Date.now() * Math.random());
    return {
        url: "http://localhost/doesnt_exist/" + r,
        name: r,
        type: e,
        data: t,
        metadata: {}
    };
}

function getJsonSpritesheet() {
    return {
        frames: {
            "0.png": {
                frame: {
                    x: 14,
                    y: 28,
                    w: 14,
                    h: 14
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: 14,
                    h: 14
                },
                sourceSize: {
                    w: 14,
                    h: 14
                },
                anchor: {
                    x: .3,
                    y: .4
                }
            },
            "1.png": {
                frame: {
                    x: 14,
                    y: 42,
                    w: 12,
                    h: 14
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: 12,
                    h: 14
                },
                sourceSize: {
                    w: 12,
                    h: 14
                }
            },
            "2.png": {
                frame: {
                    x: 14,
                    y: 14,
                    w: 14,
                    h: 14
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: 14,
                    h: 14
                },
                sourceSize: {
                    w: 14,
                    h: 14
                }
            },
            "3.png": {
                frame: {
                    x: 42,
                    y: 0,
                    w: 14,
                    h: 14
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: 14,
                    h: 14
                },
                sourceSize: {
                    w: 14,
                    h: 14
                }
            },
            "4.png": {
                frame: {
                    x: 28,
                    y: 0,
                    w: 14,
                    h: 14
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: 14,
                    h: 14
                },
                sourceSize: {
                    w: 14,
                    h: 14
                }
            },
            "5.png": {
                frame: {
                    x: 14,
                    y: 0,
                    w: 14,
                    h: 14
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: 14,
                    h: 14
                },
                sourceSize: {
                    w: 14,
                    h: 14
                }
            },
            "6.png": {
                frame: {
                    x: 0,
                    y: 42,
                    w: 14,
                    h: 14
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: 14,
                    h: 14
                },
                sourceSize: {
                    w: 14,
                    h: 14
                }
            },
            "7.png": {
                frame: {
                    x: 0,
                    y: 28,
                    w: 14,
                    h: 14
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: 14,
                    h: 14
                },
                sourceSize: {
                    w: 14,
                    h: 14
                }
            },
            "8.png": {
                frame: {
                    x: 0,
                    y: 14,
                    w: 14,
                    h: 14
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: 14,
                    h: 14
                },
                sourceSize: {
                    w: 14,
                    h: 14
                }
            },
            "9.png": {
                frame: {
                    x: 0,
                    y: 0,
                    w: 14,
                    h: 14
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: 14,
                    h: 14
                },
                sourceSize: {
                    w: 14,
                    h: 14
                }
            }
        },
        animations: {
            png123: [ "1.png", "2.png", "3.png" ]
        },
        meta: {
            app: "http://www.texturepacker.com",
            version: "1.0",
            image: "hud.png",
            format: "RGBA8888",
            size: {
                w: 64,
                h: 64
            },
            scale: "1",
            smartupdate: "$TexturePacker:SmartUpdate:47025c98c8b10634b75172d4ed7e7edc$"
        }
    };
}

it("should exist and return a function", function() {
    expect(SpritesheetLoader).to.not.be.undefined;
});

it("should install middleware", function(r) {
    var e = new Loader();
});

e.add("building1", path.join(__dirname, "resources/building1.json"));

e.load(function(e, t) {});

expect(t.building1).to.be.instanceof(LoaderResource);

expect(t.building1.spritesheet).to.be.instanceof(Spritesheet);

e.reset();

r();

var e = sinon.spy();

var e = sinon.spy();

var t = createMockResource(LoaderResource.TYPE.JSON, {});

SpritesheetLoader.use(t, e);

it("should do nothing if the resource is not JSON", function() {
    var t = {};
    SpritesheetLoader.use(t, e);
    expect(e).to.have.been.calledOnce;
    expect(t.textures).to.be.undefined;
});

var e = sinon.spy();

var t = createMockResource(LoaderResource.TYPE.JSON, getJsonSpritesheet());

expect(a).to.have.been.calledWith(t.name + "_image", path.dirname(t.url) + "/" + t.data.meta.image);

expect(t).to.have.property("textures").that.is.an("object").with.keys(Object.keys(getJsonSpritesheet().frames)).and.has.property("0.png").that.is.an.instanceof(Texture);

expect(t.textures["0.png"].frame.x).to.equal(14);

expect(t.textures["0.png"].frame.y).to.equal(28);

expect(t.textures["0.png"].defaultAnchor.x).to.equal(.3);

expect(t.textures["0.png"].defaultAnchor.y).to.equal(.4);

expect(t.textures["1.png"].defaultAnchor.x).to.equal(0);

expect(t.textures["1.png"].defaultAnchor.y).to.equal(0);

it("should do nothing if the resource is JSON, but improper format", function() {
    expect(e).to.have.been.calledOnce;
    expect(t.textures).to.be.undefined;
});

expect(t).to.have.property("spritesheet").to.have.property("animations").to.have.property("png123");

expect(t.spritesheet.animations.png123.length).to.equal(3);

expect(t.spritesheet.animations.png123[0]).to.equal(t.textures["1.png"]);

var o = createMockResource(LoaderResource.TYPE.IMAGE, new Image());

a.yields(o);

a.restore();

e.pre(function(e, t) {
    if (e.extension === "crn") {
        e.texture = Texture.EMPTY;
    }
    t();
}).add("atlas_crn", path.join(__dirname, "resources", "atlas_crn.json")).add("atlas", path.join(__dirname, "resources", "building1.json")).load(function(e, t) {});

expect(t.atlas_image.data).to.be.instanceof(HTMLImageElement);

expect(t.atlas_crn_image.data).to.not.be.instanceof(HTMLImageElement);

e.reset();

it("should load the image & create textures if json is properly formatted", function() {
    o.texture = new Texture(new BaseTexture(o.data));
    a.yields(o);
    SpritesheetLoader.use.call(r, t, e);
    a.restore();
    expect(e).to.have.been.calledOnce;
});

r();

e.add("atlas", path.join(__dirname, "resources", "atlas_error.json"));

e.load(function(e, t) {
    expect(a.calledOnce).to.be.true;
});

expect(t.atlas_image.error).to.be.instanceof(Error);

e.reset();

r();

var t = e("http://some.com/spritesheet.json", "img.png");

expect(t).to.be.equals("/img.png");

expect(t).to.be.equals("/some/dir/img.png");

expect(t).to.be.equals("/some/dir/img.png");

it("should not load binary images as an image loader type", function(r) {
    var e = new Loader();
});

expect(t).to.be.equals("/some/img.png");

expect(t).to.be.equals("http://some.com/img.png");

expect(t).to.be.equals("http://some.com/some/dir/img.png");

expect(t).to.be.equals("http://some.com/some/dir/img.png");

expect(t).to.be.equals("http://some.com/some/img.png");

it("should dispatch an error failing to load spritesheet image", function(r) {
    var a = sinon.spy(function(e, t, r) {
        expect(r.name).to.equal("atlas_image");
        expect(r.error).to.equal(e);
        expect(e.toString()).to.have.string("Failed to load element using: IMG");
    });
    var e = new Loader();
    e.onError.add(a);
});

it("should build the image url", function() {
    expect(t).to.be.equals("http://some.com/img.png");
    t = e("http://some.com/some/dir/spritesheet.json", "img.png");
    expect(t).to.be.equals("http://some.com/some/dir/img.png");
    t = e("http://some.com/some/dir/spritesheet.json", "./img.png");
    expect(t).to.be.equals("http://some.com/some/dir/img.png");
    t = e("http://some.com/some/dir/spritesheet.json", "../img.png");
    expect(t).to.be.equals("http://some.com/some/img.png");
    t = e("/spritesheet.json", "img.png");
});

expect(SpritesheetLoader.use).to.be.a("function");

Loader.registerPlugin(SpritesheetLoader);