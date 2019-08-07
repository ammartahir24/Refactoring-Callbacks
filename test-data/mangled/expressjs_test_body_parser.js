"use strict";

var http = require("http");

var methods = require("methods");

var request = require("supertest");

var bodyParser = require("..");

describe("bodyParser()", function() {
    before(function() {
        this.server = createServer();
    });
    it("should default to {}", function(e) {
        request(this.server).post("/").expect(200, "{}", e);
    });
    it("should parse JSON", function(e) {
        request(this.server).post("/").set("Content-Type", "application/json").send('{"user":"tobi"}').expect(200, '{"user":"tobi"}', e);
    });
    it("should parse x-www-form-urlencoded", function(e) {
        request(this.server).post("/").set("Content-Type", "application/x-www-form-urlencoded").send("user=tobi").expect(200, '{"user":"tobi"}', e);
    });
    it("should handle duplicated middleware", function(e) {
        var t = bodyParser();
        var r = http.createServer(function(o, s) {
            t(o, s, function(r) {
                t(o, s, function(e) {
                    var t = r || e;
                    s.statusCode = t ? t.status || 500 : 200;
                    s.end(t ? t.message : JSON.stringify(o.body));
                });
            });
        });
        request(r).post("/").set("Content-Type", "application/json").send('{"user":"tobi"}').expect(200, '{"user":"tobi"}', e);
    });
    describe("http methods", function() {
        before(function() {
            var e = bodyParser();
            this.server = http.createServer(function(t, r) {
                e(t, r, function(e) {
                    if (e) {
                        r.statusCode = 500;
                        r.end(e.message);
                        return;
                    }
                    r.statusCode = t.headers["x-expect-method"] === t.method ? t.body.user === "tobi" ? 201 : 400 : 405;
                    r.end();
                });
            });
        });
        methods.slice().sort().forEach(function(t) {
            if (t === "connect") {
                return;
            }
            it("should support " + t.toUpperCase() + " requests", function(e) {
                request(this.server)[t]("/").set("Content-Type", "application/json").set("Content-Length", "15").set("X-Expect-Method", t.toUpperCase()).send('{"user":"tobi"}').expect(201, e);
            });
        });
    });
    describe("with type option", function() {
        before(function() {
            this.server = createServer({
                limit: "1mb",
                type: "application/octet-stream"
            });
        });
        it("should parse JSON", function(e) {
            request(this.server).post("/").set("Content-Type", "application/json").send('{"user":"tobi"}').expect(200, '{"user":"tobi"}', e);
        });
        it("should parse x-www-form-urlencoded", function(e) {
            request(this.server).post("/").set("Content-Type", "application/x-www-form-urlencoded").send("user=tobi").expect(200, '{"user":"tobi"}', e);
        });
    });
    describe("with verify option", function() {
        it("should apply to json", function(e) {
            var t = createServer({
                verify: function e(t, r, o) {
                    if (o[0] === 32) throw new Error("no leading space");
                }
            });
            request(t).post("/").set("Content-Type", "application/json").send(' {"user":"tobi"}').expect(403, "no leading space", e);
        });
        it("should apply to urlencoded", function(e) {
            var t = createServer({
                verify: function e(t, r, o) {
                    if (o[0] === 32) throw new Error("no leading space");
                }
            });
            request(t).post("/").set("Content-Type", "application/x-www-form-urlencoded").send(" user=tobi").expect(403, "no leading space", e);
        });
    });
});

function createServer(e) {
    var o = bodyParser(e);
    return http.createServer(function(t, r) {
        o(t, r, function(e) {
            r.statusCode = e ? e.status || 500 : 200;
            r.end(e ? e.message : JSON.stringify(t.body));
        });
    });
}
