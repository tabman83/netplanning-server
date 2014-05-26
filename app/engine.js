var Engine = function() {};
module.exports = new Engine();

var fs = require('fs');
var conflate = require('conflate');

// Load modules from the modules folder to extend the prototype 
var fileRegex = /^(.+)\.js$/;
var files = fs.readdirSync(__dirname + '/engine/');
for(var i = 0; i < files.length; i++){
	if(fileRegex.test(files[i])){
		var fileName = fileRegex.exec(files[i])[1];
    	var module = require('./engine/' + fileName);
    	conflate(Engine.prototype, module);
	}
}



