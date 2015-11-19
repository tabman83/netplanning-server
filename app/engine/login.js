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
var AppError = require('../appError');
var convertTimeZone = require('./convertTimeZone');

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
                var timeZoneDisplayName = Config.regExes.profileTimeZoneDisplayName.exec(body)[1];
                cb(null, {
                    sessionId: sessionId,
                    name: name,
                    timeZoneDisplayName: convertTimeZone(timeZoneDisplayName)
                });
            } else {
                var err = new AppError('A network error occurred during login.');
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
                    var err = new AppError(401, 'Incorrect username or password.');
                    cb(err);
                } else if( Config.regExes.successfulLogin.test(body) ) {
                    var sessionId = Config.regExes.successfulLogin.exec(body)[1];
                    cb(null, sessionId);
                } else {
                    var err = new AppError('An error occurred during login.');
                    cb(err);
                }
            } else {
                var err = new AppError('An error occurred during login.');
                cb(err);
            }
        });
    }

    async.waterfall([
        doLogin,
        getProfile
    ], callback);
}
