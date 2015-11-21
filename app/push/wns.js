/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	wns.js
 * Created:		21 nov 2015 16.57
 * Description:	Send notifications through the Windows Notification Service
 */

var logger = require("../logger");
var wns = require('wns');
var config = require('../../config.json');

module.exports = {
	send: function(token, text1, text2) {
		var options = {
    		client_id: config.wns_client_id,
    		client_secret: config.wns_client_secret
		};

		wns.sendToastText03(token, text1, text2, options, function (err, result) {
    		if(err) {
				logger.error('Error sending push through WNS (%s)', err.message);
				logger.debug(err.newAccessToken);
				return;
			}
			logger.info('Notification delivered to the WNS (%s)', result.headers['x-wns-status']);
		});

	}
}
