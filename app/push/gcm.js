/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	gcm.js
 * Created:		21 nov 2015 16.56
 * Description:	Send notifications through the Google Cloud Messaging
 */

var logger = require("../logger");
var gcm = require('node-gcm');
var config = require('../../config.json');
var sender = new gcm.Sender(config.gcm_api_key);

module.exports = {
	send: function(token, text1, text2, badge) {
		var message = new gcm.Message({
			data: {
        		title: text1,
        		message: text2,
				badge: badge
    		}
		});
		sender.sendNoRetry(message, { registrationTokens: [token] }, function (err, result) {
    		if(err) {
				logger.error(err);
				return;
			}
    		logger.info('Notification delivered to the GCM (success=%d, failure=%d)', result.success, result.failure);
		});
	}
}
