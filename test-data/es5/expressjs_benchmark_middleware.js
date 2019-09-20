"use strict";

// https://github.com/expressjs/express/blob/3ed5090ca91f6a387e66370d57ead94d886275e1/benchmarks/middleware.js
var express = require('..');

var app = express(); // number of middleware

var n = parseInt(process.env.MW || '1', 10);
console.log('  %s middleware', n);

while (n--) {
  app.use(function (req, res, next) {
    next();
  });
}

app.use(function (req, res, next) {
  res.send('Hello World');
});
app.listen(3333);