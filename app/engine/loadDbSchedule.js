/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	loadDbSchedule.js
 * Created:		6/12/2014 02.01
 * Description:	Loads the schedule from the database
 */

module.exports = function(data, remoteItems, next) {

	var ScheduleItem = require('../models/scheduleItem');
	var moment = require('moment');

    var user = data.user;

	var startDate = moment().startOf('week').add(1,'days').toDate();

	ScheduleItem.find({
		_user: user._id,
		begin: { $gte: startDate }
	}, function(err, dbItems) {
		if(err) {
			next(err);
		} else {
			next(null, data, remoteItems, dbItems);
		}
	});
}
