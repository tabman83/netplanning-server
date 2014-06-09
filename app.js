var winston = require('winston');
var logger = new (winston.Logger)({
	transports: [
	    /*new (winston.transports.File)({ 
        	filename: '/var/log/app.log', 
        	colorize: true 
    	}),*/
    	new (winston.transports.Console)({ colorize: true, level:'debug' })
]});	
logger.extend(console);

var log = console.log;
console.log = function hijacked_log(level) {
	if (arguments.length > 1 && level in this) {
    	log.apply(this, arguments);
	} else {
    	var args = Array.prototype.slice.call(arguments);
	    args.unshift('debug');
    	log.apply(this, args);
  	}
}
console.log("Application "+process.env.npm_package_name+" "+process.env.npm_package_version+" start up");

var mongoose   = require('mongoose');
var moment = require('moment');
var async = require('async');
var helpers = require('./app/helpers');
var Engine = require('./app/engine');
var User = require('./app/models/user');
var ScheduleItem = require('./app/models/scheduleItem');

var start = function() {

/*
	var firstUser = new User({ 
		username:"R3775",
		password:"NLCGL"
	});
	
	firstUser.save(function(err) {
		if( err ) {
			console.log('Error saving test user ('+err.message+')');
		} else {
			console.log('Test user saved.');
		}
	});
*/


	var credentials = {
		username:"R3775",
		password:"NLCGL"
	};


	var loginIfNeeded = function(user, next) {
		var diff = moment().diff(user.lastLogin, 'minutes', true);
		var needsToLogin = diff > 25;
		if( !needsToLogin ) {
			next(null, user);
		} else {
			Engine.login(credentials, function(loginErr, sessionId) {
				if(loginErr) {
					next(loginErr);
				} else {
					user.sessionId = sessionId;
					user.lastLogin = new Date();
					user.save( function(saveErr) {
						if( saveErr ) {
							next(saveErr);
						} else {
							next(null, user);
						}
					});
					console.log('User '+user.username+': logged in ('+user.sessionId+')');
				}
			});
		}
	}
	
	var retrieveUser = function(next) {
		User.findOne(credentials, function(err,user) {
			next(null, user);
		});
	}
	
	var loadSchedule = function(user, next) {
		console.log('User '+user.username+': loading schedule');
		Engine.loadSchedule(user.sessionId, function(err, result) {
			if(err) {
				next(err);
			} else {
				next(null, user, result);
			}
		});		
	}


/* ChangedOrUnchanged = true/false
   AddedOrCancelled = true/false
   notified = true/false
*/

	var updateSchedule = function(user, netScheduleItems, next) {
		ScheduleItem.find({user: user._id}, function(err, dbScheduleItems) {
			if(err) {
				next(err);
			} else {
				
				var res = -1;
				var fields = ['begin', 'end'];
				
				res = helpers.difference( netScheduleItems, dbScheduleItems, fields );
				console.log(res.length);

				res = helpers.difference( dbScheduleItems, netScheduleItems, fields );
				console.log(res.length);
				
				
				next(null, user);
			}
		});
	}

	async.waterfall([
		retrieveUser,
		loginIfNeeded,
		loadSchedule,
		updateSchedule
	], function(err, result) {
		if(err) {
			console.log("err at the end of the waterfall");
			console.log(err.message);
		} else {
			console.log("NO err at the end of the waterfall");
		}
	
		mongoose.disconnect();
	});

}



mongoose.connection.on("open", function(ref) {
	console.log("Database connection successfully established");
	start();
});

mongoose.connection.on("error", function(err) {
	console.error("Database connection failed",err);
});

mongoose.connect(process.env.npm_package_config_dbUrl);
