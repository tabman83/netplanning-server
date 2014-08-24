/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	loginIfNeeded.js
 * Created:		6/12/2014 02.37
 * Description:	Logs the user in if the current user sessionId is invalid or timed out
 */

module.exports = function(data, next) {

	var request = require('request');
	var moment = require('moment');

	var Config = require('./config');
	var LoginError = require('../errors/LoginError');
	var InvalidLoginError = require('../errors/InvalidLoginError');

	var user = data.user;

	var loginRequestCallback = function (error, response, body) {

  		if (!error && response.statusCode == 200) {
  			if( Config.regExes.invalidLogin.test(body) ) {
  				var err = new InvalidLoginError("Incorrect username or password.");
  				next(err);
  			} else if( Config.regExes.successfulLogin.test(body) ) {
  				var sessionId = Config.regExes.successfulLogin.exec(body)[1];

				user.sessionId = sessionId;
				user.lastLogin = new Date();
				user.save( function(saveErr) {
					if( saveErr ) {
						next(saveErr);
					} else {
						next(null, data);
					}
				});
				console.log('User '+user.username+': logged in with session '+user.sessionId);

  			} else {
  				var err = new LoginError("An error occurred during login.");
  				next(err);
  			}
		} else {
			var err = new LoginError("A network error occurred during login.");
			next(err);
		}
	}

	var diff = moment().diff(user.lastLogin, 'minutes', true);
	var needsToLogin = diff > 25;
	if( !needsToLogin ) {
		next(null, data);
	} else {
		var rand = (new Date()).getTime();
		var options = {
			uri: Config.uris.login,
			followAllRedirects: true,
			timeout: 2000,
			qs: { cacheBust: rand },
			method: 'POST',
			form: {
				login: user.username,
				password: user.password
			}
		}
		request(options, loginRequestCallback);
	}

}
