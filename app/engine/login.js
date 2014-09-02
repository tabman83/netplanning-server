/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	login.js
 * Created:		9/1/2014 17.26
 * Description:	Logs a user in
 */

var async = require('async');
var request = require('request');

var Config = require('./config');
var LoginError = require('../errors/LoginError');
var InvalidLoginError = require('../errors/InvalidLoginError');

module.exports = function(credentials, callback) {

    var loginRequestCallback = function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if( Config.regExes.invalidLogin.test(body) ) {
                var err = new InvalidLoginError("Incorrect username or password.");
                callback(err);
            } else if( Config.regExes.successfulLogin.test(body) ) {
                var sessionId = Config.regExes.successfulLogin.exec(body)[1];
                callback(null, sessionId);
            } else {
                var err = new LoginError("An error occurred during login.");
                callback(err);
            }
        } else {
            var err = new LoginError("A network error occurred during login.");
            callback(err);
        }
    }

    var rand = (new Date()).getTime();
    var options = {
        uri: Config.uris.login,
        followAllRedirects: true,
        timeout: 2000,
        qs: { cacheBust: rand },
        method: 'POST',
        form: {
            login: credentials.username,
            password: credentials.password
        }
    }

    request(options, loginRequestCallback);
}
