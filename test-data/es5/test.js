var fs = require('fs');

var readfile = function (name, cb) {
  fs.readFile(file, "utf-8", function (err, data) {
    cb(data);
  });
};

var fname = "a.txt";
var fname2 = "b.txt";
var fname3 = "ab.txt";
readfile(fname, function (data) {
  console.log(fname2);
  readfile(fname2, function (data2) {
    console.log(fname3);
    readfile(fname3, function (data3) {
      console.log(data);
      console.log(data2);
      console.log(data3);
    });
  });
});