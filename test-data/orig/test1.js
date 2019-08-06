var fs = require('fs')

var readfile = function(name,cb){
	fs.readFile(file, "utf-8", function (err, data) {
		cb(data)
	})
}

var writefile = function(file,data,cb){
	fs.writeFile(file,data,function(err){
		cb(err);
	})
}

var list_of_files = ['a_files_directory.txt','b_files_directory.txt','c_files_directory.txt']

var To_Upper_Case = function(data){
	return data.toUpperCase()
}

var split_to_array = function(strng){
	return strng.split(" ")
}

var readfiles_from_list = function(list){
	list.forEach(function (i){
		readfile(i, function(d){
			var data = split_to_array(d)
			var first_file = data[0]
			var second_file = data[1]
			var third_file = data[2]
			readfile(first_file, function(d1){
				var d_first = To_Upper_Case(d1)
				console.log(first_file,d_first)
				writefile(first_file,d_first,function(e1){
					console.log(e1)
				})
			})
			readfile(second_file, function(d2){
				var d_snd = To_Upper_Case(d2)
				console.log(second_file,d_snd)
				writefile(second_file,d_snd,function(e2){
					console.log(e2)
				})
			})
			readfile(third_file, function(d3){
				var d_thrd = To_Upper_Case(d3)
				console.log(third_file,d_thrd)
				writefile(third_file,d_thrd,function(e3){
					console.log(e3)
				})
			})
		})
	})
}

readfiles_from_list(list_of_files);
