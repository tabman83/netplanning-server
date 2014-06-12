/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 * Created:		6/12/2014 01.55
 * Description:	Loads the schedule from the internet
 */
 
module.exports = function(user, next) {
	
	console.log('User '+user.username+': loading schedule');
	
	var async = require('async');
	
	var ArgumentError = require('../errors/ArgumentError');
	var loadSingleSchedule = require('./loadSingleSchedule');
		
	var cacheBust = (new Date()).getTime();
	var options1 = { sessionId: user.sessionId, qs: { init: true, cacheBust: cacheBust+'1' } };
	var options2 = { sessionId: user.sessionId, qs: { next: true, cacheBust: cacheBust+'2' } };
	var options3 = { sessionId: user.sessionId, qs: { next: true, cacheBust: cacheBust+'3' } };
	
	async.mapSeries([options1,options2,options3], loadSingleSchedule, function(err, results) {
		if(err) {
			callback(err);
		} else {
			var schedules = [].concat(results[0],results[1],results[2]);
			
			//changedOrUnchanged = true/false
			//addedOrCancelled = true/false
			//notified = true/false			
			var netScheduleItems = schedules.map( function( el ) {
				el.user = user._id;
				el.changedOrUnchanged = true;
				el.addedOrCancelled = true;
				el.notified = false;
				return el;
			});
			
			console.log('User '+user.username+': found '+netScheduleItems.length+' items');
			
			next(null, user, netScheduleItems);
		}
	});
		
}
