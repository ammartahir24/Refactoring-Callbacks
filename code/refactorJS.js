var fs = require("fs");
const uglifyjs = require('uglify-js')
const util = require('util')
const fread = util.promisify(fs.readFile)
const minfy = util.promisify(uglifyjs.minify)
const fwrite = util.promisify(fs.writeFile)

async function readfile (fname){
	return  await fread(fname, 'utf-8')	
} 

async function writefile(obj){
	return await fwrite('convertedast.txt',JSON.stringify(obj))
}

//converts code to ast with specified options
const codeToAst = {
	parse: {},
	compress:false,
	mangle: false,
	output: {
		ast: true,
		code: false
	}
}
//ast to code
const astToCode = {
	compress: false,
	mangle: false,
	output: {
		ast: true,
		code: true
	}	
}

async function convertCodeToAst(code){
	return uglifyjs.minify(code, codeToAst)
}

async function convertAstToCode(ast){
	return uglifyjs.minify(ast, astToCode)
}

//variables that are in scope of given variable(function,if)
scopedvars = {};
//variables given as argument of a function
funcargs = {};
//variables decalred inside scope of a function
funcvars = {};
//to differentiate anonymous functions, ast does not do automatically.
refac_funcs = {};
cbcount = 0;
var anon_count = 0;

async function readfilee(file,cb){
	fs.readFile(file, "utf-8", function (err,data){
		cb(data);
	})
}

//for callback
var getcount = function(data){
	var count =0;
	for(var key in data){
		if(data.hasOwnProperty(key)){
			if(data[key]["_class"]=="AST_Var" 
				&& data[key]["definitions"][0]["value"]!=null&& data[key]["definitions"][0]["value"]["_class"]=="AST_Function"){
				count++;
			}
			if(data[key]["_class"]=="AST_SimpleStatement"){
				if("args" in data[key]["body"]){
					templist = data[key]["body"]["args"];
					templist.forEach (function(i){
						if(i["_class"]=="AST_Function"){
							count++;
						}
					})
				}
			}
			if(data[key]["_class"]=="AST_Var" 
				&& data[key]["definitions"][0]["value"]!=null&& data[key]["definitions"][0]["value"]["_class"]=="AST_Call"){
				if("args" in  data[key]["definitions"][0]["value"]){
					templist = data[key]["definitions"][0]["value"]["args"];
					templist.forEach(function(i){
						if(i["_class"]=="AST_Function"){
							count++;
						}
					})
				}
			}
			if(data[key]['_class']=='AST_While'){
				count++;
			}
			if(data[key]['_class']=='AST_For'){
				count++;
			}
			if(data[key]['_class']=='AST_If'){
				count++;
				if(data[key]['alternative']!=null)
					count++;
			}
		}
	}
	return count;
}


//This function traverses whole ast and populates variable dictionaries declared earlier
//There are around 50-60 different keywords/combinations of keywords, we have handled 4 for
//purpose of this project, variable declaration, function call, function declaration,
//Anonymous function declaration. For loop and while loop some time malfunction.

async function printify(data, scope, list, indent,cb){
	var count = 0;
	var tcount = getcount(data);
	scopefinder(data,list,function(nlist, fvars){
		scopedvars[scope] = nlist;
		funcvars[scope] = fvars;
		var check = 0;
		for(var key in data){
			if(data.hasOwnProperty(key)){
				if(data[key]["_class"]=="AST_Var" && data[key]["definitions"][0]["value"]!=null&& data[key]["definitions"][0]["value"]["_class"]=="AST_Function"){
					funchandler(data[key]["definitions"][0]["value"]["argnames"],nlist,function(nnlist,args){
						count++;
						check = 1;
						funcargs[data[key]["definitions"][0]["name"]["name"]] = args;
						printify(data[key]["definitions"][0]["value"]["body"],data[key]["definitions"][0]["name"]["name"],nnlist,"--"+indent,function(){
							if(count===tcount){
								cb();
							}
						});
					})
				}
				else if(data[key]["_class"]=="AST_SimpleStatement"){
					if("args" in data[key]["body"]){
						templist = data[key]["body"]["args"];
						templist.forEach (function(i){
							if(i["_class"]=="AST_Function"){
								funchandler(i["argnames"],nlist,function(nnlist, args){
									var name;
									if(i["name"]==null){
										i["fname"] = "f"+anon_count++;
										name = i["fname"]
									}
									else{
										name  = i["name"]["name"];
									}
									count++;
									funcargs[name] = args;
									check = 1;
									printify(i["body"],name,nnlist,"--"+indent,function(){
										if(count==tcount){
											cb();
										}
									});
								})
							}
						});
					}
				}
				else if(data[key]['_class']=='AST_While'){
					count++;
					printify(data[key]['body']['body'],'while'+anon_count++,nlist,"--"+indent,function(){
						if(count==tcount){
							cb();
						}
					})
				}
				else if(data[key]["_class"]=="AST_For"){
					if(data[key]['init']['_class']=="AST_Var"){
						nlist.push(data[key]['init']['definitions'][0]['name']['name']);
					}
					templist = data[key]['body']['body']
					count++;
					printify(templist,"for"+anon_count++,nlist,"--"+indent,function(){
						if(count==tcount){
							cb();
						}
					})
				}
				//write code for if condition  here:
				else if(data[key]["_class"]=="AST_If"){
					console.log(data[key])
					count++;
					printify(data[key]['body']['body'],'if'+anon_count++,nlist,"--"+indent,function(){
						if(count==tcount){
							cb()
						}
					})
					if(data[key]['alternative']!=null){
						count++;
						printify([data[key]['alternative']],"if"+anon_count++,nlist,"--"+indent,function(){
							console.log("IF COND")
							if(count==tcount){
								cb()
							}
						})
					}
				}

				else if(data[key]["_class"]=="AST_Var" &&data[key]["definitions"][0]["value"]!=null&& data[key]["definitions"][0]["value"]["_class"]=="AST_Call" 
					&& "args" in  data[key]["definitions"][0]["value"]){
					templist = data[key]["definitions"][0]["value"]["args"];
					templist.forEach (function(i){
						if(i["_class"]=="AST_Function"){
							funchandler(i["argnames"],nlist,function(nnlist, args){
								var name;
								if(i["name"]==null){
									i["fname"] = "f"+anon_count++;
									name = i["fname"]
								}
								else{
									name = i["name"]["name"]
								}
								console.log(name)
								count++;
								funcargs[name] = args;
								check = 1;
								printify(i["body"],name,nnlist,"--"+indent,function(){
									if(count==tcount){
										cb();
									}
								});
							})
						}
					});
				}
			}
		}
		if(check==0){
			cb()
		}
	});
}
//returns a list of arguments of a given function call/ declaration
var funchandler = function(data, liste, cb){
	list = []
	args = []
	for(var i=0; i<liste.length; i++){
		list.push(liste[i])
	}
	for (var i=0; i<data.length; i++){
		list.push(data[i]["name"]);
		args.push(data[i]["name"]);
	}
	console.log(list,args)
	cb(list,args);
}

//finds all variables with keyword var
var scopefinder = function(data, liste, cb){
	list = []
	fvars = []
	for(var i=0; i<liste.length; i++){
		list.push(liste[i])
	}
	for(var key in data){
		if(data.hasOwnProperty(key)){
			if(data[key]["_class"]=="AST_Var" &&data[key]["definitions"][0]["value"]!=null&& 
data[key]["definitions"][0]["value"]["_class"]!="AST_Function"){
				list.push(data[key]["definitions"][0]["name"]["name"]);
				fvars.push(data[key]["definitions"][0]["name"]["name"]);
			}
		}
	}
	cb(list,fvars);
}


//We use UglifyJS's CLI utility tree obtained by 'Uglifyjs -o ast [filename]' to traverse the tree,
//and make decisions based on it(same tree as used for function to find scopes). However
//this tree cannot be converted back to code, so we make actual changes in UglifyJS's API utility
//ast

//refactor function traverses the tree and looks for all the functions that can be classified as 
//callback functions. It then makes use of the scope dictionaries populated earlier to make decision
//on reactoring or retaining an instruction.

//Refactor runs recursively and first instruction it refactors is for the inside most function. It then
//returns to its callee's scope and refactors from there. Thus it refactors every line it decides is executable
//earlier. This can sometimes affect the functionality of program.

//As stated earlier refactor also works on certain keywords. Rest of the implementation for other keywords
//can be done in retty similar fashion.

var extractFuncName = function(exp){
	if (exp['_class']=='AST_SymbolRef'){
		return exp['name'];
	}
	return extractFuncName(exp['expression'])+"."+exp['property']
}

var refactor = function(data,mdata,name,mname,mast,ast,signal){
	for (var key in data){
		if(data.hasOwnProperty(key)){
			if(data[key]["_class"]=="AST_Var" &&data[key]["definitions"][0]["value"]!=null&& data[key]["definitions"][0]["value"]["_class"]=="AST_Function"){
				refactor(data[key]["definitions"][0]["value"]["body"],data,data[key]["definitions"][0]["name"]["name"],name,ast,ast[key]["definitions"][0]["value"]["body"],0);
			}
			else if(data[key]["_class"]=="AST_SimpleStatement" && "args" in data[key]["body"]){
				templist = data[key]["body"]["args"];
				templist.forEach (function(i){
					if(i["_class"]=="AST_Function"){
						var nem;
						var index;
						if(i["name"]!=null){
							nem = i["name"]["name"]
							index = templist.findIndex(x =>x["name"]["name"]==nem);
						}
						else{
							nem = i["fname"]
							index = templist.findIndex(x =>x["fname"]==nem);
						}
						refactor(i["body"],data,nem,name,ast,ast[key]["body"]["args"][index]["body"],1);
					}
				})
			}
			else if(data[key]['_class']=='AST_For'){
				refactor(data[key]['body']['body'],data,'for',name,ast,ast[key]['body']['body'],0)
			}
			else if(data[key]['_class']=='AST_While'){
				refactor(data[key]['body']['body'],data,'while',name,ast,ast[key]['body']['body'],0)
			}
			//write code for if condition here

			else if(data[key]["_class"]=="AST_Var" && data[key]["definitions"][0]["value"]!=null&& data[key]["definitions"][0]["value"]["_class"]=="AST_Call" 
					&& "args" in  data[key]["definitions"][0]["value"]){
				templist = data[key]["definitions"][0]["value"]["args"];
				templist.forEach (function(i){
					if(i["_class"]=="AST_Function"){
						var nem;
						var index;
						if(i["name"]!=null){
							nem = i["name"]["name"]
							index = templist.findIndex(x =>x["name"]["name"]==nem);
						}
						else{
							nem = i["fname"]
							index = templist.findIndex(x =>x["fname"]==nem);
						}
						if(ast[key]['body']!=null)
							refactor(i["body"],data,nem,name,ast,ast[key]["body"]["args"][index]["body"],1);
					}
				})
			}
		}
	}
	if(signal){
		//console.log(name,"-------------------------")
		to_refactor = [];
		d_refactor = [];
		indices = [];
		for(var i=0; i<ast.length; i++){
			if(data[i]['_class']=='AST_For'){
				if(loophandler(data[i]['body'],name)){
					console.log("refactored at line number: ",ast[i]['start']['line'])
					// to_refactor.push(ast[i])
					// d_refactor.push(ast[i]);
					indices.push(i)
				}
			}
			//write code for if condition here
			else if(data[i]["_class"]=="AST_Var"){
				if(data[i]['definitions'][0]['_class']=='AST_VarDef'){
					if(data[i]['definitions'][0]['value']!=null && data[i]['definitions'][0]['value']['_class']=='AST_Call'){
						var nem = data[i]['definitions'][0]['name']['name'];
						liste = data[i]['definitions'][0]['value']['args']
						var move = true;
						for(var j=0; j<liste.length; j++){
							if(liste[j]['_class']=='AST_Function'){
								if(ismoveable(liste[j],name)){
									continue;
								}
								else{
									move=false;
								}
							}
							if(liste[j]['_class']=='AST_SymbolRef'){
								if(funcargs[name].indexOf(liste[j]['name'])>=0){
									console.log()
									move=false;
								}
								else if(funcvars[name].indexOf(liste[j]['name'])>=0){
									move = false;
								}
							}
						}
						if(move==true){
							console.log("refactored at line number: ",ast[i]['start']['line'])
							// to_refactor.push(ast[i]);
							// d_refactor.push(data[i]);
							indices.push(i)
							//ast.splice(i,1)
							//i--;
							funcvars[name].splice(funcvars[name].indexOf(nem),1);
							funcvars[mname].push(nem);
						}
					}				
				}
			}
			else if(data[i]["_class"]=="AST_Function"){
				if(ismoveable(data[i],name)){
					console.log("refactored at line number: ",ast[i]['start']['line'])
					cbcount++;
					console.log(data[i])
					//to_refactor.push(ast[i]);
					//d_refactor.push(data[i]);
					indices.push(i)
					//ast.splice(i,1);
					//i--;
				}
			}
		}
		for(var i=0; i<ast.length; i++){
			if(data[i]["_class"]=="AST_SimpleStatement"){
				if(data[i]['body']['_class']=='AST_Call'){
					liste = data[i]['body']['args'];
					var move = true;
					for(var j=0; j<liste.length; j++){
						if(liste[j]['_class']=='AST_Function'){
							if(ismoveable(liste[j],name)){
								continue;
							}
							else{
								move=false;
							}
						}
						if(liste[j]['_class']=='AST_SymbolRef'){
							if(funcargs[name].indexOf(liste[j]['name'])>=0){
								move=false;
							}
							else if(funcvars[name].indexOf(liste[j]['name'])>=0){
								move = false;
							}
						}
					}
					if(move==true){
						console.log("refactored at line number: ",ast[i]['start']['line'])
						cbcount++;
						var funcname = extractFuncName(data[i]['body']['expression'])
						if (refac_funcs.hasOwnProperty(funcname)){
							refac_funcs[funcname]++;
						}
						else{
							refac_funcs[funcname] = 1
						}
						// console.log("second",extractFuncName(data[i]['body']['expression']))
						//to_refactor.push(ast[i]);
						//d_refactor.push(data[i]);
						indices.push(i)
						//ast.splice(i,1)
						//i--;
					}
				}
			}
		}
		del_count = 0;
		indices.sort();
		for(var i=0; i<indices.length; i++){
			to_refactor.push(ast[indices[i]])
			d_refactor.push(data[indices[i]])
		}
		for(var i=0; i<indices.length; i++){
			data.splice((indices[i]-del_count),1)
			ast.splice((indices[i]-del_count),1)
			del_count++;
		}
		for(var i=0; i<to_refactor.length; i++){
			mast.push(to_refactor[i]);
			mdata.push(d_refactor[i]);
		}
	}
}


//This function checks if the lambda/anonymous function is movable or not. Note: equations like
// var x = (10+y)*z; i.e. numeric equations may make a function unfactorable because these cases
//are not implemented yet.

var ismoveable = function(data, name){
	for(var i=0; i<data['argnames'].length; i++){
		if(data['argnames'][i]['_class']=='AST_SymbolFuncarg'){
			if(funcvars[name].indexOf(data['argnames'][i]['name'])>=0){
				return false;
			}
		}
	}
	for(var i=0; i<data['body'].length; i++){
		here = data['body'][i]
		if(here['_class']=='AST_SimpleStatement'){
			if(here['body']['_class']=='AST_Call'){
				tlength = here['body']['args'].length
				for(var j=0; j<tlength; j++){
					arghere = here['body']['args'][j]
					if(arghere['_class']=='AST_SymbolRef'){
						if(funcvars[name].indexOf(arghere['name'])>=0){
							return false;
						}
						if(funcargs[name].indexOf(arghere['name'])>=0){
							//console.log(name,arghere)
							return false;
						}
					}
					if(arghere['_class']=='AST_Function'){
						if(ismoveable(arghere,name)){
							continue;
						}
						else{
							return false;
						}
					}
				}
			}
		}
	}
	return true;
}

//Checks if loop is refactorable, working partially. UglifyJS's loop handling is giving faulty behaviour at
//times.

var loophandler = function(data, name){
	for(var i=0; i<data['body'].length; i++){
		here = data['body'][i]
		if(here['_class']=='AST_SimpleStatement'){
			if(here['body']['_class']=='AST_Call'){
				tlength = here['body']['args'].length
				for(var j=0; j<tlength; j++){
					arghere = here['body']['args'][j]
					if(arghere['_class']=='AST_SymbolRef'){
						if(funcvars[name].indexOf(arghere['name'])>=0){
							return false;
						}
						if(funcargs[name].indexOf(arghere['name'])>=0){
							return false;
						}
					}
					if(arghere['_class']=='AST_Function'){
						if(ismoveable(arghere,name)){
							continue;
						}
						else{
							return false;
						}
					}
				}
			}
		}
	}
	return true;
}

async function prog(fname){
	var code = await readfile(fname)
	var resultAst = await convertCodeToAst(code)
	var ast = resultAst
	//Get the CLI AST by running this command:
		// Uglifyjs -o ast [file]
	//Copy paste std-out from cmd into a new json file and replace its name here
	readfilee(jsonfile,async function(data){
		cdata = JSON.parse(data);
		printify(cdata["body"],"main",[],">",async function(){
			console.log("---------Vars in scope----------------------")
			for(var key in scopedvars){
				console.log(key,scopedvars[key]);
			}
			console.log("---------Func Args--------------------------")
			for(var key in funcargs){
				console.log(key, funcargs[key]);
			}
			console.log("---------Vars declared here-----------------")
			for(var key in funcvars){
				console.log(key, funcvars[key]);
			}
			refactor(cdata["body"],cdata["body"],"main","main",ast['ast']['body'],ast['ast']['body'],0);
			console.log("---------refactored code--------------------")
			var resultCode = await convertAstToCode(resultAst.ast)
			codelines = resultCode.code.split(';')
			for(var i=0; i<codelines.length; i++){
				console.log(codelines[i])
			}
			console.log("---------Refactored function count----------")
			for (var key in refac_funcs){
				console.log(key,":",refac_funcs[key])
			}
		});
	})
}
//Change JS file's name here
jsfile = process.argv[2]
jsonfile = process.argv[3]
prog(jsfile)
