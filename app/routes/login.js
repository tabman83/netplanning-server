/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   login.js
 * Created:		8/28/2014 16.16
 * Description:	Login API
 */

var jwt = require('jsonwebtoken');
var passport = require('passport');

module.exports = function (req, res, next) {

    passport.authenticate('local-login', function(err, user, info) {

        if (err) {
            return next(err);
        }

        if (!user) {
            return res.json(info.code, { message: info.message });
        }

        //user has authenticated correctly thus we create a JWT token
        var token = jwt.sign({ userId: user._id }, process.env.npm_package_config_secret);
        res.json({ token : token });

  })(req, res, next);

}
