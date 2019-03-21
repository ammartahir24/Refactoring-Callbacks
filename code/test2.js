var fs = require('fs');

var readfile = function(file, cb) {
	fs.readFile(file, "utf-8", function (err, data) {
		console.log("data");
		var datal = data.length;
		console.log(datal)
	});
	cb('done');
};

var fact = function fact(n) {
	if (n < 1) {
		var q = n-1;
		return 1;
	}
	return n * fact(n - 1);
};


var nfunc = function() {
	var file = "test.txt";
	var n = "ajhsjahd";
	n = n-n+n;
	readfile(file, function (data) {
	console.log(n.length);
	console.log(data);
	});
	for(var i=0; i<data.length; i++){
		var k = 0;
		console.log(data[i]);
	}
	var g=9;
	while(g>0){
		g--;
	}
	list = [1,2,3]
	list.forEach(function(i){
		i++;
	})
}

nfunc()