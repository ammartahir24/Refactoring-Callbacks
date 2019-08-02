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

var Append_To_Name = function(pre,post){
	return pre+post
}

var convert_files = function(list){
	list.forEach(function (i){
		readfile(i, function(data){
			data = data.split(" ")
			var first_file = data[0]
			var second_file = data[1]
			var third_file = data[2]
			readfile(first_file, function(d1){
				readfile(second_file, function(d2){
					readfile(third_file, function(d3){
						var name_1 = Append_To_Name("1".first_file)
						var name_2 = Append_To_Name("2".second_file)
						var name_3 = Append_To_Name("3".third_file)
						var d1_cap = To_Upper_Case(d1)
						var d2_cap = To_Upper_Case(d2)
						var d3_cap = To_Upper_Case(d3)
						console.log(name_1,d1_cap)
						console.log(name_2,d2_cap)
						console.log(name_3,d3_cap)
						writefile(name_1,d1_cap,function(e){
							console.log(e)
						})
						writefile(name_2,d2_cap,function(e){
							console.log(e)
						})
						writefile(name_3,d3_cap,function(e){
							console.log(e)
						})
					})
				})
			})
		})
	})
}

convert_files(list_of_files);
