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
    if( req.params.id === undefined ) {
        return res.status(401).json({ message: 'Missing uuid parameter.' });
    }

    Token.remove({
        _user: req.user._id,
        uuid: req.params.id
    }, function(err) {
        if (err) {
            next(err);
            return;
        }
        return res.status(200).json({ message: 'Token successfully removed.' });
    });
}
