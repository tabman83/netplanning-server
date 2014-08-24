/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 * Created:		May 2014
 * Description:	Core engine
 */

var Engine = {};

var async = require('async');

var loginIfNeeded = require('./loginIfNeeded');
var loadNetSchedule = require('./loadNetSchedule');
var loadDbSchedule = require('./loadDbSchedule');
var updateSchedule = require('./updateSchedule');
var notifyChanges = require('./notifyChanges');

Engine.loadAndUpdateSchedule = function(data, next) {

	var fnStartup = function(next) {
		next( null, data );
	}

	async.waterfall([
		fnStartup,
		loginIfNeeded,
		loadNetSchedule,
		loadDbSchedule,
		updateSchedule,
        notifyChanges
	], next);

}

module.exports = Engine;
