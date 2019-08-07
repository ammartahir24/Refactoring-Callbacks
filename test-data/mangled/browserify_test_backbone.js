"use strict";

var browserify = require("../");

var vm = require("vm");

var backbone = require("backbone");

var test = require("tap").test;

test("backbone", function(o) {
    o.plan(3);
    var e = browserify();
    e.require("backbone");
    e.bundle(function(e, r) {
        o.ok(Buffer.isBuffer(r));
        var t = r.toString("utf8");
        o.ok(t.length > 0);
        var n = {
            console: console
        };
        vm.runInNewContext(t, n);
        o.deepEqual(Object.keys(backbone).sort(), Object.keys(n.require("backbone")).sort());
        o.end();
    });
});
