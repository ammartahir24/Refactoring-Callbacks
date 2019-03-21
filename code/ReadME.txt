First create the command line tree by the following command:
	uglifyjs --output ast file-name.js > file-name.JSON
Then run refactorjs through the following command: 
	node refactorJS.js file-name.js file-name.JSON
