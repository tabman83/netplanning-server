/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	loadDbSchedule.js
 * Created:		6/12/2014 02.01
 * Description:	Loads the schedule from the database
 */

module.exports = function(data, netScheduleItems, next) {

	var ScheduleItem = require('../models/scheduleItem');

    var user = data.user;

	ScheduleItem.find({
		user: user._id,
		begin: { $gt: Date.now() }
	}, function(err, dbScheduleItems) {
		if(err) {
			next(err);
		} else {
			next(null, data, netScheduleItems, dbScheduleItems);
		}
	});
}
