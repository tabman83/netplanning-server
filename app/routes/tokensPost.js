/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   tokensPost.js
 * Created:		September 1, 2014 19.26
 * Description:	POST /Tokens API
 */

var logger  = require("../logger");
var Token   = require('../models/token');

module.exports = function (req, res, next) {

    if( req.body.device === undefined ) {
        res.status(401).json({ message: 'Missing device parameter.' });
        return;
    }

    Token.findOneAndUpdate({
        // conditions
        _user: req.user._id
    }, {
        // update
        _user: req.user._id,
        token: req.body.token,
        device: req.body.device,
        uuid: req.body.uuid,
        model: req.body.model,
        version: req.body.version
    }, {
        // options
        upsert: true
    }, function(err, token) {
        if (err) {
            next(err);
            return;
        }
        res.status(201).json({ message: 'Token successfully updated.' });
        return;
    });
}
