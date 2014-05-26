var Engine = module.exports;

Engine.login = function(credentials, callback) {

	var request = require('request');
	var InvalidLoginError = require('../errors/InvalidLoginError');
	var LoginError = require('../errors/LoginError');
	var ArgumentError = require('../errors/ArgumentError');

	var loginRequestCallback = function (error, response, body) {
  		if (!error && response.statusCode == 200) {
  			if( Engine._regexes.invalidLogin.test(body) ) {
  				var err = new InvalidLoginError("Incorrect username or password.");
  				callback(err);
  			} else if( this._regexes.successfulLogin.test(body) ) {
  				var sessionId = this._regexes.successfulLogin.exec(body)[1];
  				callback(null,sessionId);
  			} else {
  				var err = new LoginError("An error occurred during login.");
  				callback(err);  				
  			}
    	} else {
			var err = new LoginError("A network error occurred during login.");
			callback(err);    	
		}
  	}
	
	if( credentials && credentials.username && credentials.password && credentials.username.length>0 && credentials.password.length>0 ) {
		var rand = (new Date()).getTime();
		var options = {
			uri: this._uris.login,
			followAllRedirects: true,
			timeout: 5000,
			qs: { cachebuster: rand },
			method: 'POST',
			form: {
				login: credentials.username,
				password: credentials.password
			}
		}
		request(options, loginRequestCallback);
		
	} else {
		var err = new ArgumentError('Missing username or password.');
		callback(err);
	}
}
