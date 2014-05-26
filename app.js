
var Engine = require('./app/engine');

console.log(Engine);

Engine.login({
	username:"R3775",
	password:"NLCGL"
}, function(err, result) {
	if(err) {
		console.log(err);		
	} else {
		console.log(result);
	}
});







