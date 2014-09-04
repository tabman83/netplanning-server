/*!
* NetPlanning Engine
* Antonino Parisi <tabman83@gmail.com>
*
* File name:	updateSchedule.js
* Created:		6/12/2014 02.06
* Description:	Updates the schedule to the database
*/

var moment          = require('moment');
var logger          = require("../logger");
var helpers         = require('../utils/helpers');
var ScheduleItem    = require('../models/scheduleItem');

module.exports = function(data, netScheduleItems, dbScheduleItems, next) {

    var user = data.user;

    // net - db
    var netMinusDb = helpers.difference( netScheduleItems, dbScheduleItems, ['begin', 'end', 'kind'] );
    logger.debug('User %s: Net-Db: %d', user.username, netMinusDb.length);

    // db - net
    var dbMinusNet = helpers.difference( dbScheduleItems, netScheduleItems, ['begin', 'end', 'kind'] );
    logger.debug('User %s: Db-Net: %d', user.username, dbMinusNet.length);

    // asynchronously delete old items
    var today = (new Date()).setHours(0,0,0,0);

    ScheduleItem.remove({
        user : user._id,
        end  : {
            $lt: today
        }
    }).exec();

    ScheduleItem.create(netMinusDb, function (err) {
        if (err) {
            next(err);
        } else {
            next(null, data);
        }
    });
}
