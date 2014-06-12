/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	updateSchedule.js
 * Created:		6/12/2014 02.06
 * Description:	Updates the schedule to the database
 */
 
module.exports = function(user, netScheduleItems, dbScheduleItems, next) {

	var helpers = require('../helpers');
	var ScheduleItem = require('../models/scheduleItem');	
	
	// net - db
	var netMinusDb = helpers.difference( netScheduleItems, dbScheduleItems, ['kind'] );
	console.log("netMinusDb: "+netMinusDb.length);
	
	// db - net
	var dbMinusNet = helpers.difference( dbScheduleItems, netScheduleItems, ['kind'] );
	console.log("dbMinusNet: "+dbMinusNet.length);
			
	ScheduleItem.create(netMinusDb, function (err) {
	
	  	if (err) {
	  		next(err, user);
	  	} else {
	  		next(null, user);
	  	}
	  	
	});
}
