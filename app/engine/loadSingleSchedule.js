/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   loadSingleSchedule.js
 * Created:     12/2014
 * Description:	Loads a single page of the schedule
 */

var util 			= require('util');
var cheerio 		= require('cheerio');
var request 		= require('request');
var moment 			= require('moment-timezone');
var Config 			= require('./config');
var logger          = require("../logger");
var AppError 		= require('../appError');

module.exports = function( options, callback ) {

	var loadSingleScheduleCallback = function (error, response, body) {
		if (!error && response.statusCode == 200) {

  			if( Config.regExes.sessionTimedOut.test(body) ) {
  				var err = new AppError(401, 'Your session timed out.');
  				callback(err);
  			} else {

  				var scheduleItems = [];
  				$ = cheerio.load(body);
				var tds = $('tr>td[style="width:80px"]');

				tds.each( function(i, htmlEl) {
					var htmlEl = $(htmlEl);
					var className = htmlEl.attr('class');

					var begin = htmlEl.attr('debut');
					var end = htmlEl.attr('fin');
					var content = htmlEl.html();

					var aMatch = null;

					aMatch = content.match(Config.regExes.scheduleUserId);
					var userId = (aMatch && aMatch.length) ? aMatch[1] : null;

					aMatch = content.match(Config.regExes.scheduleName);
					var name = (aMatch && aMatch.length) ? aMatch[1] : null;

					aMatch = content.match(Config.regExes.scheduleReason);
					var reason = (aMatch && aMatch.length) ? aMatch[1] : null;
					/*
					switch( className ) {
						case 'dispo' : // available
						case 'indispo' : // not available at all
						case 'indispoPonctuelle': // made unavailable by you
						case 'reserve' : // One-Off reservation
						case 'recurrente' : // Automatic Rebooking
						case 'training' :
						case 'dispo_stag2' : // Slots made available by you
						case 's_indispo2' : // no more bookable beacause time passed
						case 'training' : // training lesson
						case 'reserveRemplacement' // substitution
						case 'instantHelp' : // instant help
						case 'special1' : // tutorial lesson
						case 'special2' : // special lesson
					}
					*/
  					scheduleItems.push({
  						begin: moment.tz(parseInt(begin, 10), options.user.timeZoneDisplayName).toDate(),
  						end: moment.tz(parseInt(end, 10), options.user.timeZoneDisplayName).toDate(),
  						reason: reason,
  						kind: className,
  						userId: userId,
  						name: name
  					});
				});
  				callback(null, scheduleItems);
  			}
		} else {
			var err = new AppError(500, 'A network error occurred during schedule load.');
			callback(err);
		}
  	}

	var scheduleUri = util.format( Config.uris.scheduleUri, options.sessionId );
	var urlOptions = {
		uri: scheduleUri,
		gzip: true,
		encoding: 'binary',
		followAllRedirects: true,
		timeout: 10000,
		qs: options.qs,
		method: 'GET'
	}

	request(urlOptions, loadSingleScheduleCallback);
}
