/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   tokensPost.js
 * Created:		9/1/2014 19.26
 * Description:	POST /Tokens API
 */

var logger  = require("../logger");
var Token   = require('../models/token');

module.exports = function (req, res, next) {
    if( req.body.token === undefined ) {
        res.json(401, { message: 'Missing token parameter.' });
        return;
    }

    if( req.body.deviceType === undefined ) {
        res.json(401, { message: 'Missing deviceType parameter.' });
        return;
    }

    Token.create({
        user: req.user.userId,
        deviceType: req.body.deviceType,
        value: req.body.token
    }, function(err, token) {
        if (err) {
            next(err);
            return;
        }
        res.json(201, { message: 'Token successfully added.' });
        return;
    });
}
