var mongoose   		= require('mongoose');
var express			= require('express');
var passport 		= require('passport');
var bodyParser		= require('body-parser');
var methodOverride	= require('method-override');
var apn 			= require('apn');
var logger 			= require("./app/logger");
var helpers 		= require('./app/helpers');
var Engine 			= require('./app/engine');
var Routes			= require('./app/routes');
var User 			= require('./app/models/user');

var app				= express();
var apnConnection = null;

logger.info("Application %s %s starting up.", process.env.npm_package_name, process.env.npm_package_version);

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
	app.use(bodyParser());
	app.use(methodOverride());
	app.use(passport.initialize());

	var router = express.Router();
	Routes(router, passport);

	app.use('/v1', router );

	app.use(function(err, req, res, next){
	  	if(err) {
	  		logger.error('Server error: '+err.message);
	  		res.send(500, 'Internal server error.');
		}
	});

	var server = app.listen(process.env.npm_package_config_port, process.env.npm_package_config_hostName, function() {
		logger.info('Listening on %s %s:%d.', process.env.npm_package_config_hostName, server.address().address, server.address().port);
	});


	var credentials = {
		username: "R3775",
		password: "NLCGL"
	};

	/*
	User.create({
		username:"R3775",
		password:"NLCGL"
	},function() {
		mongoose.disconnect();
	});
	return;
	*/

/*
	User.findOne(credentials, function(err, user) {

		var data = {
			user: user,
			apnConnection: apnConnection
		};

		Engine.loadAndUpdateSchedule( data, function(err, data) {
			if(err) {
				logger.debug('User '+user.username+': error occurred ('+String(err)+')');
			} else {
				logger.debug('User '+user.username+': Done.');
			}

			dispose(function () {
				logger.debug('Database connection disconnected');
			});
		});
	});*/

}

process.on('SIGINT', function() {
	dispose(function () {
    	logger.info('Database connection disconnected due to app termination.');
    	process.exit(0);
	});
});

init( appStart );
