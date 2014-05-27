
var Engine = require('./engine');

Engine.login({
	username:"R3775",
	password:"NLCGL"
}, function(err, sessionId) {
	if(err) {
		console.log(err);		
	} else {
		Engine.loadSchedule(sessionId, function(err, result) {
			if(err) {
				console.log(err);		
			} else {
				console.log(result);
			}
		});
	}
});







