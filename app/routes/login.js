/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   login.js
 * Created:		8/28/2014 16.16
 * Description:	Login API
 */

var jwt     = require('jsonwebtoken');
var util    = require("util");
var logger  = require("../logger");
var User    = require('../models/user');
var Engine 	= require('../engine');
var AppError = require('../appError');
var config  = require('../../config.json');


module.exports = function (req, res, next) {

    if( req.body.username === undefined || req.body.password === undefined ) {
        return next(new AppError(401, 'Missing credentials.'));
    }

    var username = req.body.username.toUpperCase();
    var password = req.body.password.toUpperCase();

    User.findOne({ username : username }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err) {
            next(err);
            return;
        }

        if (!user) {
            // user is not in our database yet, try to search it on the netplanning website
            Engine.login({
                username: username,
                password: password
            }, function( err, result ) {
                if(err) {
                    // user is not present on the netplanning website
                    return next(new AppError(404, 'User not found.'));
                }
                // user has been found on the netplanning website thus we register it
                User.create({
                    username: username,
                    password: password,
                    sessionId: result.sessionId,
                    name: result.name,
                    timeZoneDisplayName: result.timeZoneDisplayName,
                    lastLogin: Date.now()
                }, function(err, newUser) {
                    if (err) {
                        next(err);
                        return;
                    }
                    req.app.locals.pmxUsersCounter.inc();
                    Engine.loadAndUpdateSchedule({
                        user: newUser
                    }, function(err) {
                        if (err) {
                            next(err);
                            return;
                        }
                        //user has been registered thus we create a JWT token
                        var authToken = jwt.sign({ userId: newUser._id }, config.secret);
                        res.status(200).json({
                            authToken : authToken,
                            name: newUser.name
                        });
                    });
                });
            });
            return;
        }

        if( user.password !== password) {
            return next(new AppError(403, 'Invalid password.'));
        }

        //user has authenticated correctly thus we create a JWT token
        var authToken = jwt.sign({ userId: user._id }, config.secret);
        res.status(200).json({
            authToken : authToken,
            name: user.name
        });
    });
}
