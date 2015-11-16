/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	loginIfNeeded.js
 * Created:		6/12/2014 02.37
 * Description:	Logs the user in if the current user sessionId is invalid or timed out
 */

var logger = require("../logger");
var request = require('request');
var moment = require('moment');

var Config = require('./config');
var LoginError = require('../errors/LoginError');
var InvalidLoginError = require('../errors/InvalidLoginError');
var performLogin = require('./login');

module.exports = function(data, next) {

	var user = data.user;
	var diff = moment().diff(user.lastLogin, 'minutes', true);
	var needsToLogin = diff > 25;
	if( !needsToLogin ) {
		logger.debug('User %s (%s) has a valid session.', user.name, user.username);
		next(null, data);
	} else {
		performLogin({
			username: user.username,
			password: user.password
		}, function(err, result) {
			if(err) {
				next(err);
			} else {
				user.sessionId = result.sessionId;
				user.lastLogin = new Date();
				user.name = result.name;
				user.save( function(saveErr) {
					if( saveErr ) {
						logger.error('Error saving user login.');
						next(saveErr);
					} else {
						next(null, data);
					}
				});
			}
		});
	}
}
