var fs = require('fs');

var readfile = function (name, cb) {
  fs.readFile(file, "utf-8", function (err, data) {
    cb(data);
  });
};

var writefile = function (file, data, cb) {
  fs.writeFile(file, data, function (err) {
    cb(err);
  });
};

var list_of_files = ['a.txt', 'b.txt', 'c.txt'];

var To_Upper_Case = function (data) {
  return data.toUpperCase();
};

var readfiles_from_list = function (list) {
  list.forEach(function (i) {
    readfile(i, function (data) {
      var first_file = data[0];
      var second_file = data[1];
      var third_file = data[2];
      readfile(first_file, function (d1) {
        readfile(second_file, function (d2) {
          readfile(third_file, function (d3) {
            var n_first = To_Upper_Case(first_file);
            var n_snd = To_Upper_Case(second_file);
            var n_thrd = To_Upper_Case(third_file);
            console.log(n_first, d1);
            console.log(n_snd, d2);
            console.log(n_thrd, d3);
            writefile(first_file, d1, function (e1) {
              console.log(e1);
            });
            writefile(second_file, d2, function (e2) {
              console.log(e2);
            });
            writefile(third_file, d3, function (e3) {
              console.log(e3);
            });
          });
        });
      });
    });
  });
};

readfiles_from_list(list_of_files);