/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	updateSchedule.js
 * Created:		6/12/2014 02.06
 * Description:	Updates the schedule to the database
 */
 
module.exports = function(user, netScheduleItems, dbScheduleItems, next) {

	var moment = require('moment');
	var helpers = require('../helpers');	
	var ScheduleItem = require('../models/scheduleItem');	
	
	// net - db
	var netMinusDb = helpers.difference( netScheduleItems, dbScheduleItems, ['begin','end','kind'] );
	console.log("netMinusDb: "+netMinusDb.length);
	
	// db - net
	var dbMinusNet = helpers.difference( dbScheduleItems, netScheduleItems, ['begin','end','kind'] );
	console.log("dbMinusNet: "+dbMinusNet.length);
	
	// asynchronously delete old items
	var today = (new Date()).setHours(0,0,0,0);
	
	ScheduleItem.remove({
		user : user._id, 
		end  : { 
			$lt: today 
		}
	}, function() {
			
		ScheduleItem.create(netMinusDb, function (err) {
	
		  	if (err) {
		  		next(err, user);
		  	} else {
		  		next(null, user);
		  	}
		  	
		});
	});
}
