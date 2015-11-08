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

module.exports = function (req, res, next) {

    if( req.body.username === undefined || req.body.password === undefined ) {
        return res.json(401, { message: 'Missing credentials.' });
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
            }, function( err, sessionId ) {
                if(err) {
                    // user is not present on the netplanning website
                    res.json(404, { message: 'User not found.' });
                    return;
                }
                // user has been found on the netplanning website thus we register it
                User.create({
                    username: username,
                    password: password,
                    sessionId: sessionId,
                    lastLogin: Date.now()
                },function(err, newUser) {
                    if (err) {
                        next(err);
                        return;
                    }
                    //user has been registered thus we create a JWT token
                    var authToken = jwt.sign({ userId: newUser._id }, process.env.npm_package_config_secret);
                    res.json(200, { authToken : authToken });
                });
            });
            return;
        }

        if( user.password !== password) {
            res.json(403, { message: 'Invalid password.' });
            return;
        }

        //user has authenticated correctly thus we create a JWT token
        var authToken = jwt.sign({ userId: user._id }, process.env.npm_package_config_secret);
        res.json(200, { authToken : authToken });
    });
}
