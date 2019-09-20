"use strict";

var script = process.cwd() + "/" + process.argv[2];

var spawn = require("child_process").spawn;

var numbers = [];

var boringResults = 0;

var scriptRuns = 0;

function runScript() {
    scriptRuns++;
    var u = spawn(process.execPath, [ script ]);
    var i = "";
    u.stdout.on("data", function(r) {
        i += r;
        var n;
        while ((n = i.indexOf("\n")) > -1) {
            var e = parseInt(i.substr(0, n), 10);
            i = i.substr(n + 1);
            var s = max();
            var t = min();
            numbers.push(e);
            if (s === max() && t === min()) {
                boringResults++;
            }
            if (boringResults > 10) {
                boringResults = 0;
                u.kill();
                runScript();
            }
        }
    });
}

function report() {
    console.log("max: %s | median: %s | sdev: %s | last: %s | min: %s | runs: %s | results: %s", max(), median(), sdev(), numbers[numbers.length - 1], min(), scriptRuns, numbers.length);
}

function min() {
    if (!numbers.length) return undefined;
    return numbers.reduce(function(r, n) {
        return n < r ? n : r;
    });
}

function max() {
    if (!numbers.length) return undefined;
    return numbers.reduce(function(r, n) {
        return n > r ? n : r;
    });
}

function median() {
    return numbers[Math.floor(numbers.length / 2)];
}

function sdev() {
    if (!numbers.length) return undefined;
    return Math.round(Math.sqrt(variance()));
}

function variance() {
    var r = 0;
    var n = 0;
    var e = numbers.length;
    for (var s = 0; s < e; s++) {
        var t = numbers[s];
        r += t;
        n += Math.pow(t, 2);
    }
    return n / e - Math.pow(r / e, 2);
}

setInterval(report, 1e3);

runScript();
