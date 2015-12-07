/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	index.js
 * Created:		21 nov 2015 16.54
 * Description:	Send notifications through the Apple Push Notification Sercive
 */

var logger = require("../logger");

module.exports = {
	send: function(token, text1, text2) {
		logger.info('Sending through APNS: %s %s', text1, text2);
	}
}
