/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 */
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var Engine = {};
	
	var util = require('util');
	var async = require('async');
	var request = require('request');
	var cheerio = require('cheerio');
	
	var Config = require('./config');
	
	var InvalidLoginError = require('../errors/InvalidLoginError');
	var LoginError = require('../errors/LoginError');
	var ArgumentError = require('../errors/ArgumentError');
	var SessionError = require('../errors/SessionError');

	Engine.loadSingleSchedule = function( options, callback ) {
		
		var loadSingleScheduleCallback = function (error, response, body) {
			if (!error && response.statusCode == 200) {
	  			if( Config.regExes.sessionTimedOut.test(body) ) {
	  				var err = new SessionError("Your session timed out.");
	  				callback(err);
	  			} else {
	  				var scheduleItems = [];
	  				$ = cheerio.load(body);
					var tds = $('tr>td[style="width:80px"]');
		
					tds.each( function(i, htmlEl) {
						var htmlEl = $(htmlEl);
						var className = htmlEl.attr('class');
						
						if( className === 'indispo' ) {
							return true;
						}
						
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
	  						begin: new Date(parseInt(begin,10)),
	  						end: new Date(parseInt(end,10)),
	  						reason: reason,
	  						kind: className,
	  						userId: userId,
	  						name: name
	  					});	  					
					});  					
	  				callback(null, scheduleItems);
	  			}
			} else {
				var err = new SessionError("A network error occurred during schedule load.");
				callback(err);    	
			}
	  	}
	
		var scheduleUri = util.format( Config.uris.scheduleUri, options.sessionId );
		var options = {
			uri: scheduleUri,
			followAllRedirects: true,
			timeout: 2000,
			qs: options.qs,
			method: 'GET'
		}
		request(options, loadSingleScheduleCallback);		
	}
	
	
	Engine.loadSchedule = function(sessionId, callback) {
	
		if( sessionId && sessionId.length > 0) {
		
			var cacheBust = (new Date()).getTime();
			var options1 = { sessionId: sessionId, qs: { init: true, cacheBust: cacheBust+'1' } };
			var options2 = { sessionId: sessionId, qs: { next: true, cacheBust: cacheBust+'2' } };
			var options3 = { sessionId: sessionId, qs: { next: true, cacheBust: cacheBust+'3' } };
			
			async.mapSeries([options1,options2,options3], Engine.loadSingleSchedule, function(err, results) {
			
				if(err) {
					callback(err);
				} else {
					var schedules = [].concat(results[0],results[1],results[2]);
					callback(null, schedules);
				}
			});
			
		}
		else
		{
			var err = new ArgumentError('Missing session Id.');
			callback(err);
		}	
	}


	Engine.login = function(credentials, callback) {

		var loginRequestCallback = function (error, response, body) {
	  		if (!error && response.statusCode == 200) {
	  			if( Config.regExes.invalidLogin.test(body) ) {
	  				var err = new InvalidLoginError("Incorrect username or password.");
	  				callback(err);
	  			} else if( Config.regExes.successfulLogin.test(body) ) {
	  				var sessionId = Config.regExes.successfulLogin.exec(body)[1];
	  				callback(null,sessionId);
	  			} else {
	  				var err = new LoginError("An error occurred during login.");
	  				callback(err);  				
	  			}
			} else {
				var err = new LoginError("A network error occurred during login.");
				callback(err);    	
			}
	  	}
	
		if( credentials && credentials.username && credentials.password && credentials.username.length>0 && credentials.password.length>0 ) {
			var rand = (new Date()).getTime();
			var options = {
				uri: Config.uris.login,
				followAllRedirects: true,
				timeout: 2000,
				qs: { cacheBust: rand },
				method: 'POST',
				form: {
					login: credentials.username,
					password: credentials.password
				}
			}
			request(options, loginRequestCallback);
		
		} else {
			var err = new ArgumentError('Missing username or password.');
			callback(err);
		}
	}
    

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Engine;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return Engine;
        });
    }
    // included directly via <script> tag
    else {
        this.Engine = Engine;
    }

}());


