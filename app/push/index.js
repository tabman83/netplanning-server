/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	index.js
 * Created:		21 nov 2015 16.18
 * Description:	Push notifications
 */

var Token = require('../models/token')
var logger = require("../logger");
var apns = require("./apns");
var gcm = require("./gcm");
var wns = require("./wns");

module.exports = {

	sendNotification: function(user, text1, text2) {

		//Engine.login = require('./login');
		Token.find({
			_user: user._id
		}, function(err, tokens) {
			if(err) {
				logger.error(err);
				return
			}
			tokens.forEach(function(token) {
				switch(token.device) {
					case 'Android':
						gcm.send(token.token, text1, text2);
						break;
					case 'iOS':
						apns.send(token.token, text1, text2);
						break;
					case 'windows':
						wns.send(token.token, text1, text2);
						break;
					default:
						logger.info('%s\t%s\tNo push service found for device %s.', user.username, user.name, token.device);
						break;
				}
			});
		});
	}
};
