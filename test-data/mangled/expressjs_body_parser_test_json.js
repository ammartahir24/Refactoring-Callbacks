"use strict";

var assert = require("assert");

var Buffer = require("safe-buffer").Buffer;

var http = require("http");

var request = require("supertest");

var bodyParser = require("..");

describe("bodyParser.json()", function() {
    it("should parse JSON", function(e) {
        request(createServer()).post("/").set("Content-Type", "application/json").send('{"user":"tobi"}').expect(200, '{"user":"tobi"}', e);
    });
    it("should handle Content-Length: 0", function(e) {
        request(createServer()).get("/").set("Content-Type", "application/json").set("Content-Length", "0").expect(200, "{}", e);
    });
    it("should handle empty message-body", function(e) {
        request(createServer()).get("/").set("Content-Type", "application/json").set("Transfer-Encoding", "chunked").expect(200, "{}", e);
    });
    it("should handle no message-body", function(e) {
        request(createServer()).get("/").set("Content-Type", "application/json").unset("Transfer-Encoding").expect(200, "{}", e);
    });
    it("should 400 when invalid content-length", function(e) {
        var n = bodyParser.json();
        var t = createServer(function(e, t, r) {
            e.headers["content-length"] = "20";
            n(e, t, r);
        });
        request(t).post("/").set("Content-Type", "application/json").send('{"str":').expect(400, /content length/, e);
    });
    it("should handle duplicated middleware", function(e) {
        var o = bodyParser.json();
        var t = createServer(function(t, r, n) {
            o(t, r, function(e) {
                if (e) return n(e);
                o(t, r, n);
            });
        });
        request(t).post("/").set("Content-Type", "application/json").send('{"user":"tobi"}').expect(200, '{"user":"tobi"}', e);
    });
    describe("when JSON is invalid", function() {
        before(function() {
            this.server = createServer();
        });
        it("should 400 for bad token", function(e) {
            request(this.server).post("/").set("Content-Type", "application/json").send("{:").expect(400, parseError("{:"), e);
        });
        it("should 400 for incomplete", function(e) {
            request(this.server).post("/").set("Content-Type", "application/json").send('{"user"').expect(400, parseError('{"user"'), e);
        });
        it('should error with type = "entity.parse.failed"', function(e) {
            request(this.server).post("/").set("Content-Type", "application/json").set("X-Error-Property", "type").send(' {"user"').expect(400, "entity.parse.failed", e);
        });
        it("should include original body on error object", function(e) {
            request(this.server).post("/").set("Content-Type", "application/json").set("X-Error-Property", "body").send(' {"user"').expect(400, ' {"user"', e);
        });
    });
    describe("with limit option", function() {
        it("should 413 when over limit with Content-Length", function(e) {
            var t = Buffer.alloc(1024, ".");
            request(createServer({
                limit: "1kb"
            })).post("/").set("Content-Type", "application/json").set("Content-Length", "1034").send(JSON.stringify({
                str: t.toString()
            })).expect(413, e);
        });
        it('should error with type = "entity.too.large"', function(e) {
            var t = Buffer.alloc(1024, ".");
            request(createServer({
                limit: "1kb"
            })).post("/").set("Content-Type", "application/json").set("Content-Length", "1034").set("X-Error-Property", "type").send(JSON.stringify({
                str: t.toString()
            })).expect(413, "entity.too.large", e);
        });
        it("should 413 when over limit with chunked encoding", function(e) {
            var t = Buffer.alloc(1024, ".");
            var r = createServer({
                limit: "1kb"
            });
            var n = request(r).post("/");
            n.set("Content-Type", "application/json");
            n.set("Transfer-Encoding", "chunked");
            n.write('{"str":');
            n.write('"' + t.toString() + '"}');
            n.expect(413, e);
        });
        it("should accept number of bytes", function(e) {
            var t = Buffer.alloc(1024, ".");
            request(createServer({
                limit: 1024
            })).post("/").set("Content-Type", "application/json").send(JSON.stringify({
                str: t.toString()
            })).expect(413, e);
        });
        it("should not change when options altered", function(e) {
            var t = Buffer.alloc(1024, ".");
            var r = {
                limit: "1kb"
            };
            var n = createServer(r);
            r.limit = "100kb";
            request(n).post("/").set("Content-Type", "application/json").send(JSON.stringify({
                str: t.toString()
            })).expect(413, e);
        });
        it("should not hang response", function(e) {
            var t = Buffer.alloc(10240, ".");
            var r = createServer({
                limit: "8kb"
            });
            var n = request(r).post("/");
            n.set("Content-Type", "application/json");
            n.write(t);
            n.write(t);
            n.write(t);
            n.expect(413, e);
        });
    });
    describe("with inflate option", function() {
        describe("when false", function() {
            before(function() {
                this.server = createServer({
                    inflate: false
                });
            });
            it("should not accept content-encoding", function(e) {
                var t = request(this.server).post("/");
                t.set("Content-Encoding", "gzip");
                t.set("Content-Type", "application/json");
                t.write(Buffer.from("1f8b080000000000000bab56ca4bcc4d55b2527ab16e97522d00515be1cc0e000000", "hex"));
                t.expect(415, "content encoding unsupported", e);
            });
        });
        describe("when true", function() {
            before(function() {
                this.server = createServer({
                    inflate: true
                });
            });
            it("should accept content-encoding", function(e) {
                var t = request(this.server).post("/");
                t.set("Content-Encoding", "gzip");
                t.set("Content-Type", "application/json");
                t.write(Buffer.from("1f8b080000000000000bab56ca4bcc4d55b2527ab16e97522d00515be1cc0e000000", "hex"));
                t.expect(200, '{"name":"论"}', e);
            });
        });
    });
    describe("with strict option", function() {
        describe("when undefined", function() {
            before(function() {
                this.server = createServer();
            });
            it("should 400 on primitives", function(e) {
                request(this.server).post("/").set("Content-Type", "application/json").send("true").expect(400, parseError("#rue").replace("#", "t"), e);
            });
        });
        describe("when false", function() {
            before(function() {
                this.server = createServer({
                    strict: false
                });
            });
            it("should parse primitives", function(e) {
                request(this.server).post("/").set("Content-Type", "application/json").send("true").expect(200, "true", e);
            });
        });
        describe("when true", function() {
            before(function() {
                this.server = createServer({
                    strict: true
                });
            });
            it("should not parse primitives", function(e) {
                request(this.server).post("/").set("Content-Type", "application/json").send("true").expect(400, parseError("#rue").replace("#", "t"), e);
            });
            it("should not parse primitives with leading whitespaces", function(e) {
                request(this.server).post("/").set("Content-Type", "application/json").send("    true").expect(400, parseError("    #rue").replace("#", "t"), e);
            });
            it("should allow leading whitespaces in JSON", function(e) {
                request(this.server).post("/").set("Content-Type", "application/json").send('   { "user": "tobi" }').expect(200, '{"user":"tobi"}', e);
            });
            it('should error with type = "entity.parse.failed"', function(e) {
                request(this.server).post("/").set("Content-Type", "application/json").set("X-Error-Property", "type").send("true").expect(400, "entity.parse.failed", e);
            });
            it("should include correct message in stack trace", function(e) {
                request(this.server).post("/").set("Content-Type", "application/json").set("X-Error-Property", "stack").send("true").expect(400).expect(shouldContainInBody(parseError("#rue").replace("#", "t"))).end(e);
            });
        });
    });
    describe("with type option", function() {
        describe('when "application/vnd.api+json"', function() {
            before(function() {
                this.server = createServer({
                    type: "application/vnd.api+json"
                });
            });
            it("should parse JSON for custom type", function(e) {
                request(this.server).post("/").set("Content-Type", "application/vnd.api+json").send('{"user":"tobi"}').expect(200, '{"user":"tobi"}', e);
            });
            it("should ignore standard type", function(e) {
                request(this.server).post("/").set("Content-Type", "application/json").send('{"user":"tobi"}').expect(200, "{}", e);
            });
        });
        describe('when ["application/json", "application/vnd.api+json"]', function() {
            before(function() {
                this.server = createServer({
                    type: [ "application/json", "application/vnd.api+json" ]
                });
            });
            it('should parse JSON for "application/json"', function(e) {
                request(this.server).post("/").set("Content-Type", "application/json").send('{"user":"tobi"}').expect(200, '{"user":"tobi"}', e);
            });
            it('should parse JSON for "application/vnd.api+json"', function(e) {
                request(this.server).post("/").set("Content-Type", "application/vnd.api+json").send('{"user":"tobi"}').expect(200, '{"user":"tobi"}', e);
            });
            it('should ignore "application/x-json"', function(e) {
                request(this.server).post("/").set("Content-Type", "application/x-json").send('{"user":"tobi"}').expect(200, "{}", e);
            });
        });
        describe("when a function", function() {
            it("should parse when truthy value returned", function(e) {
                var t = createServer({
                    type: r
                });
                function r(e) {
                    return e.headers["content-type"] === "application/vnd.api+json";
                }
                request(t).post("/").set("Content-Type", "application/vnd.api+json").send('{"user":"tobi"}').expect(200, '{"user":"tobi"}', e);
            });
            it("should work without content-type", function(e) {
                var t = createServer({
                    type: r
                });
                function r(e) {
                    return true;
                }
                var n = request(t).post("/");
                n.write('{"user":"tobi"}');
                n.expect(200, '{"user":"tobi"}', e);
            });
            it("should not invoke without a body", function(e) {
                var t = createServer({
                    type: r
                });
                function r(e) {
                    throw new Error("oops!");
                }
                request(t).get("/").expect(200, e);
            });
        });
    });
    describe("with verify option", function() {
        it("should assert value if function", function() {
            assert.throws(createServer.bind(null, {
                verify: "lol"
            }), /TypeError: option verify must be function/);
        });
        it("should error from verify", function(e) {
            var t = createServer({
                verify: function e(t, r, n) {
                    if (n[0] === 91) throw new Error("no arrays");
                }
            });
            request(t).post("/").set("Content-Type", "application/json").send('["tobi"]').expect(403, "no arrays", e);
        });
        it('should error with type = "entity.verify.failed"', function(e) {
            var t = createServer({
                verify: function e(t, r, n) {
                    if (n[0] === 91) throw new Error("no arrays");
                }
            });
            request(t).post("/").set("Content-Type", "application/json").set("X-Error-Property", "type").send('["tobi"]').expect(403, "entity.verify.failed", e);
        });
        it("should allow custom codes", function(e) {
            var t = createServer({
                verify: function e(t, r, n) {
                    if (n[0] !== 91) return;
                    var o = new Error("no arrays");
                    o.status = 400;
                    throw o;
                }
            });
            request(t).post("/").set("Content-Type", "application/json").send('["tobi"]').expect(400, "no arrays", e);
        });
        it("should allow custom type", function(e) {
            var t = createServer({
                verify: function e(t, r, n) {
                    if (n[0] !== 91) return;
                    var o = new Error("no arrays");
                    o.type = "foo.bar";
                    throw o;
                }
            });
            request(t).post("/").set("Content-Type", "application/json").set("X-Error-Property", "type").send('["tobi"]').expect(403, "foo.bar", e);
        });
        it("should include original body on error object", function(e) {
            var t = createServer({
                verify: function e(t, r, n) {
                    if (n[0] === 91) throw new Error("no arrays");
                }
            });
            request(t).post("/").set("Content-Type", "application/json").set("X-Error-Property", "body").send('["tobi"]').expect(403, '["tobi"]', e);
        });
        it("should allow pass-through", function(e) {
            var t = createServer({
                verify: function e(t, r, n) {
                    if (n[0] === 91) throw new Error("no arrays");
                }
            });
            request(t).post("/").set("Content-Type", "application/json").send('{"user":"tobi"}').expect(200, '{"user":"tobi"}', e);
        });
        it("should work with different charsets", function(e) {
            var t = createServer({
                verify: function e(t, r, n) {
                    if (n[0] === 91) throw new Error("no arrays");
                }
            });
            var r = request(t).post("/");
            r.set("Content-Type", "application/json; charset=utf-16");
            r.write(Buffer.from("feff007b0022006e0061006d00650022003a00228bba0022007d", "hex"));
            r.expect(200, '{"name":"论"}', e);
        });
        it("should 415 on unknown charset prior to verify", function(e) {
            var t = createServer({
                verify: function e(t, r, n) {
                    throw new Error("unexpected verify call");
                }
            });
            var r = request(t).post("/");
            r.set("Content-Type", "application/json; charset=x-bogus");
            r.write(Buffer.from("00000000", "hex"));
            r.expect(415, 'unsupported charset "X-BOGUS"', e);
        });
    });
    describe("charset", function() {
        before(function() {
            this.server = createServer();
        });
        it("should parse utf-8", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Type", "application/json; charset=utf-8");
            t.write(Buffer.from("7b226e616d65223a22e8aeba227d", "hex"));
            t.expect(200, '{"name":"论"}', e);
        });
        it("should parse utf-16", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Type", "application/json; charset=utf-16");
            t.write(Buffer.from("feff007b0022006e0061006d00650022003a00228bba0022007d", "hex"));
            t.expect(200, '{"name":"论"}', e);
        });
        it("should parse when content-length != char length", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Type", "application/json; charset=utf-8");
            t.set("Content-Length", "13");
            t.write(Buffer.from("7b2274657374223a22c3a5227d", "hex"));
            t.expect(200, '{"test":"å"}', e);
        });
        it("should default to utf-8", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Type", "application/json");
            t.write(Buffer.from("7b226e616d65223a22e8aeba227d", "hex"));
            t.expect(200, '{"name":"论"}', e);
        });
        it("should fail on unknown charset", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Type", "application/json; charset=koi8-r");
            t.write(Buffer.from("7b226e616d65223a22cec5d4227d", "hex"));
            t.expect(415, 'unsupported charset "KOI8-R"', e);
        });
        it('should error with type = "charset.unsupported"', function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Type", "application/json; charset=koi8-r");
            t.set("X-Error-Property", "type");
            t.write(Buffer.from("7b226e616d65223a22cec5d4227d", "hex"));
            t.expect(415, "charset.unsupported", e);
        });
    });
    describe("encoding", function() {
        before(function() {
            this.server = createServer({
                limit: "1kb"
            });
        });
        it("should parse without encoding", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Type", "application/json");
            t.write(Buffer.from("7b226e616d65223a22e8aeba227d", "hex"));
            t.expect(200, '{"name":"论"}', e);
        });
        it("should support identity encoding", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Encoding", "identity");
            t.set("Content-Type", "application/json");
            t.write(Buffer.from("7b226e616d65223a22e8aeba227d", "hex"));
            t.expect(200, '{"name":"论"}', e);
        });
        it("should support gzip encoding", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Encoding", "gzip");
            t.set("Content-Type", "application/json");
            t.write(Buffer.from("1f8b080000000000000bab56ca4bcc4d55b2527ab16e97522d00515be1cc0e000000", "hex"));
            t.expect(200, '{"name":"论"}', e);
        });
        it("should support deflate encoding", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Encoding", "deflate");
            t.set("Content-Type", "application/json");
            t.write(Buffer.from("789cab56ca4bcc4d55b2527ab16e97522d00274505ac", "hex"));
            t.expect(200, '{"name":"论"}', e);
        });
        it("should be case-insensitive", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Encoding", "GZIP");
            t.set("Content-Type", "application/json");
            t.write(Buffer.from("1f8b080000000000000bab56ca4bcc4d55b2527ab16e97522d00515be1cc0e000000", "hex"));
            t.expect(200, '{"name":"论"}', e);
        });
        it("should 415 on unknown encoding", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Encoding", "nulls");
            t.set("Content-Type", "application/json");
            t.write(Buffer.from("000000000000", "hex"));
            t.expect(415, 'unsupported content encoding "nulls"', e);
        });
        it('should error with type = "encoding.unsupported"', function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Encoding", "nulls");
            t.set("Content-Type", "application/json");
            t.set("X-Error-Property", "type");
            t.write(Buffer.from("000000000000", "hex"));
            t.expect(415, "encoding.unsupported", e);
        });
        it("should 400 on malformed encoding", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Encoding", "gzip");
            t.set("Content-Type", "application/json");
            t.write(Buffer.from("1f8b080000000000000bab56cc4d55b2527ab16e97522d00515be1cc0e000000", "hex"));
            t.expect(400, e);
        });
        it("should 413 when inflated value exceeds limit", function(e) {
            var t = request(this.server).post("/");
            t.set("Content-Encoding", "gzip");
            t.set("Content-Type", "application/json");
            t.write(Buffer.from("1f8b080000000000000bedc1010d000000c2a0f74f6d0f071400000000000000", "hex"));
            t.write(Buffer.from("0000000000000000000000000000000000000000000000000000000000000000", "hex"));
            t.write(Buffer.from("0000000000000000004f0625b3b71650c30000", "hex"));
            t.expect(413, e);
        });
    });
});

function createServer(e) {
    var n = typeof e !== "function" ? bodyParser.json(e) : e;
    return http.createServer(function(t, r) {
        n(t, r, function(e) {
            if (e) {
                r.statusCode = e.status || 500;
                r.end(e[t.headers["x-error-property"] || "message"]);
            } else {
                r.statusCode = 200;
                r.end(JSON.stringify(t.body));
            }
        });
    });
}

function parseError(e) {
    try {
        JSON.parse(e);
        throw new SyntaxError("strict violation");
    } catch (e) {
        return e.message;
    }
}

function shouldContainInBody(t) {
    return function(e) {
        assert.ok(e.text.indexOf(t) !== -1, "expected '" + e.text + "' to contain '" + t + "'");
    };
}
