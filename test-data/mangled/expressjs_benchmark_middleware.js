"use strict";

var express = require("..");

var app = express();

var n = parseInt(process.env.MW || "1", 10);

console.log("  %s middleware", n);

while (n--) {
    app.use(function(e, s, n) {
        n();
    });
}

app.use(function(e, s, n) {
    s.send("Hello World");
});

app.listen(3333);
