/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 * Created:		8/24/2014 13.29
 * Description:	Notify the user for any change
 */

var logger = require("../logger");

module.exports = function(data, next) {

    var async = require('async');
    var apn = require('apn');
    var strings = require('../strings');

    var user = data.user;
    var apnConnection = data.apnConnection;

    var ScheduleItem = require('../models/scheduleItem');

    var fnCountAddedOrCancelled = function(addedOrCancelled) {
        return function(callback) {
            ScheduleItem.count({
                user: user._id,
                notified: false,
                addedOrCancelled: addedOrCancelled,
                changedOrUnchanged: true
            }, callback);
        }
    }

    var countCallback = function(err, counts) {
        if( err ) {
            next( err );
        } else {
            var countAdded = counts[0];
            var countCancelled = counts[1];
            var notificationMessage = null;

            switch (true) {
                case countAdded > 0 && countCancelled == 0:
                    notificationMessage = strings(null,'notificationNewLessons',countAdded);
                    break;
                case countAdded == 0 && countCancelled > 0:
                    notificationMessage = strings(null,'notificationCancelledLessons',countCancelled);
                    break;
                case countAdded > 0 && countCancelled > 0:
                    notificationMessage = strings(null,'notificationNewCancelledLessons',countAdded,countCancelled);
                    break;
            }

            logger.debug('Sending notification message: '+notificationMessage);
            var appleDevice = new apn.Device(user.apple); // ale: d3dc68fe85aa1a821f2be96ba07aaf84e4bce97d1981a573c5f57c6d9fa642fc
            var note = new apn.Notification();
            var expirationHours = 1;  // Expires 1 hour from now.
            note.expiry = Math.floor(Date.now() / 1000) + (3600*expirationHours);
            note.badge = countAdded;
            note.sound = "ping.aiff";
            note.alert = notificationMessage;
            //note.payload = {'messageFrom': 'Caroline'};
            apnConnection.pushNotification(note, appleDevice);

            next(null, data);
        }
    }

    async.parallel( [fnCountAddedOrCancelled(true), fnCountAddedOrCancelled(false)], countCallback );
}
