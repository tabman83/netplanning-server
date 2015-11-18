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
var util = require('util');

var Config = require('./config');
var LoginError = require('../errors/LoginError');
var InvalidLoginError = require('../errors/InvalidLoginError');

module.exports = function(credentials, callback) {


    function getProfile(sessionId, cb) {
        var profileUri = util.format( Config.uris.top, sessionId );
        request({
            uri: profileUri,
            followAllRedirects: true,
            timeout: 10000,
            qs: { cacheBust: Date.now() },
            method: 'GET'
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var name = Config.regExes.profileName.exec(body)[1];
                cb(null, {
                    sessionId: sessionId,
                    name: name
                });
            } else {
                var err = new LoginError("A network error occurred during login.");
                cb(err);
            }
        });
    }

    function doLogin(cb) {
        request({
            uri: Config.uris.login,
            followAllRedirects: true,
            timeout: 10000,
            qs: { cacheBust: Date.now() },
            method: 'POST',
            form: {
                login: credentials.username,
                password: credentials.password
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if( Config.regExes.invalidLogin.test(body) ) {
                    var err = new InvalidLoginError("Incorrect username or password.");
                    cb(err);
                } else if( Config.regExes.successfulLogin.test(body) ) {
                    var sessionId = Config.regExes.successfulLogin.exec(body)[1];
                    cb(null, sessionId);
                } else {
                    var err = new LoginError("An error occurred during login.");
                    cb(err);
                }
            } else {
                var err = new LoginError("A network error occurred during login.");
                cb(err);
            }
        });
    }



    async.waterfall([
        doLogin,
        getProfile
    ], function(err, results) {
        if(err) {
            callback(err)
        } else {
            var result = {
                sessionId: results[0],
                name: results[1]
            };
            callback(null, results);
        }
    });


}
