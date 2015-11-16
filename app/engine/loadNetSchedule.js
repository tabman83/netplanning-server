/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   loadNetSchedule.js
 * Created:		6/12/2014 01.55
 * Description:	Loads the schedule from the internet
 */

var logger = require("../logger");
var async = require('async');

var ArgumentError = require('../errors/ArgumentError');
var loadSingleSchedule = require('./loadSingleSchedule');

module.exports = function(data, next) {

    var user = data.user;
	logger.debug('User %s: loading schedule.', user.username);

	var cacheBust = (new Date()).getTime();
	var options1 = { sessionId: user.sessionId, qs: { init: true, cacheBust: cacheBust+'1' } };
	var options2 = { sessionId: user.sessionId, qs: { next: true, cacheBust: cacheBust+'2' } };
	var options3 = { sessionId: user.sessionId, qs: { next: true, cacheBust: cacheBust+'3' } };

	async.mapSeries([options1,options2,options3], loadSingleSchedule, function(err, results) {
		if(err) {
			next(err);
		} else {
			var schedules = [].concat(results[0],results[1],results[2]);

			//changedOrUnchanged = true/false
			//addedOrCancelled = true/false
			//notified = true/false
			var netScheduleItems = schedules.map( function( el ) {
				el._user = user._id;
				return el;
			});

            user.update({ $set: { lastCheck: Date.now() } }).exec();

			logger.debug('User %s: found %d items.', user.username, netScheduleItems.length);

			next(null, data, netScheduleItems);
		}
	});

}
