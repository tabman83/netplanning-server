/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   tokensDelete.js
 * Created:		9/2/2014 01:38
 * Description:	DELETE /Tokens API
 */

var logger  = require("../logger");
var Token   = require('../models/token');

module.exports = function (req, res, next) {
    if( req.body.token === undefined ) {
        res.json(401, { message: 'Missing token parameter.' });
        return;
    }

    Token.remove({
        user: req.user.userId,
        value: req.body.token
    }, function(err) {
        if (err) {
            next(err);
            return;
        }
        res.json(200, { message: 'Token successfully removed.' });
        return;
    });
}
