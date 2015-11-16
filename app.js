var mongoose   		= require('mongoose');
var express			= require('express');
var apn 			= require('apn');
var async 			= require('async');
var logger 			= require("./app/logger");
var Engine 			= require('./app/engine');
var Routes			= require('./app/routes');
var User 			= require('./app/models/user');

var app				= express();
var apnConnection  = null;

logger.info("%s %s starting up.", process.env.npm_package_name, process.env.npm_package_version);

// initializes app and create resources
var init = function(callback) {
	var options = {
		cert: 'certs/prod/cert.pem',
		key: 'certs/prod/key.pem',
		production: true
	};
	apnConnection = new apn.Connection(options);

	mongoose.connection.on("open", function(ref) {
		logger.info("Database connection successfully established.");
		callback();
	});
	mongoose.connection.on("error", function(err) {
		logger.error("Database connection failed.", err);
	});
	mongoose.connect(process.env.npm_package_config_dbUrl);
}

var dispose = function(callback) {
	apnConnection.shutdown();
	mongoose.connection.close(callback);
}

var appStart = function() {

	app.use(require('morgan')('tiny', { stream: logger.stream }));
	app.use(require('body-parser')());
	app.use(require('method-override')());
	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Signature, Authorization, Origin, X-Requested-With, Content-Type, Accept');
		next();
	});
	app.use(require('./app/utils/signature')({ secret: process.env.npm_package_config_secret, skip: '/v1/login' }));

	var router = express.Router();
	Routes(router);

	app.use('/v1', router);

	app.use(function(err, req, res, next) {
	  	if(err) {
	  		logger.error(err.message);
			return res.json(err.status || 500, { message: err.message });
		}
	});

	var server = app.listen(process.env.npm_package_config_port, function() {
		logger.info('Listening on %s:%d.', server.address().address, server.address().port);
	});

/*
	var credentials = {
		username: "R3775",
		password: "NLCGL"
	};
*/
	/*
	User.create({
		username:"R3775",
		password:"NLCGL"
	},function() {
		mongoose.disconnect();
	});
	return;
	*/


	var processingQueue = async.queue(function (user, cb) {
	    logger.info('Scanning user %s (%s).', user.name, user.username);
		Engine.loadAndUpdateSchedule({
			user: user,
			apnConnection: apnConnection
		}, cb);
	}, 2);

	//User.findOne(credentials).populate('schedule').exec( function(err, user) {
	User.find().exec( function(err, users) {
		if(err) {
			return;
		}
		if( users.length === 0) {
			logger.info('No users to scan for updates.');
			return;
		}
		logger.info('Scanning %d users for updates of planning.', users.length);
		processingQueue.push(users, function(err) {
			logger.error(err);
		});
	});

}

process.on('SIGINT', function() {
	dispose(function () {
    	logger.info('Database connection disconnected due to app termination.');
    	process.exit(0);
	});
});

init( appStart );
