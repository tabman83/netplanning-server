var mongoose   		= require('mongoose');
var express			= require('express');
var apn 			= require('apn');
var async 			= require('async');
var logger 			= require("./app/logger");
var Engine 			= require('./app/engine');
var Routes			= require('./app/routes');
var User 			= require('./app/models/user');
var AppError		= require('./app/appError');
var Push			= require('./app/push');
var app				= express();
var config 			= require('./config.json');

logger.info("%s %s starting up.", process.env.npm_package_name, process.env.npm_package_version);

// initializes app and create resources
var init = function(callback) {
	var options = {
		cert: 'certs/prod/cert.pem',
		key: 'certs/prod/key.pem',
		production: true
	};

	mongoose.connection.on('open', function(ref) {
		logger.info('Database connection successfully established.');
		callback();
	});
	mongoose.connection.on('error', function(err) {
		logger.error('Database connection failed (%s).', err.message);
		dispose(function () {
			logger.info('Process terminated.');
	    	process.exit(0);
		});
	});
	logger.info('Attempting database connection...');
	mongoose.connect(config.db_url);
}

var dispose = function(callback) {
	//apnConnection.shutdown();
	mongoose.connection.close(callback);
}

var appStart = function() {

	app.use(require('morgan')('common', { stream: logger.stream }));
	app.use(require('body-parser')());
	app.use(require('method-override')());
	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Signature, Authorization, Origin, X-Requested-With, Content-Type, Accept');
		next();
	});
	app.use(require('./app/utils/signature')({ secret: config.secret, skip: '/v1/login' }));

	app.use(function(req, res, next) {
		if (req.method === 'OPTIONS' || req.decoded === undefined) {
			next();
			return;
		}
		User.findById(req.decoded.userId, function(err, user) {
			if(err) {
				next(err);
				return;
			}

			if(user === null) {
				return next(new AppError(401, 'Session not found'));
			} else {
				req.user = user;
				next();
			}
		});
	});

	var router = express.Router();
	Routes(router);

	app.use('/v1', router);

	app.use(function(err, req, res, next) {
	  	if(err) {
	  		logger.error(err.message, err.status);
			return res.status(err.status || 500).json({ message: err.message });
		}
	});

	var server = app.listen(config.port, function() {
		logger.info('Listening on %s:%d.', server.address().address, server.address().port);
	});

	var processingQueue = async.queue(function (user, cb) {
	    logger.info('Scanning user %s (%s).', user.name, user.username);
		Engine.loadAndUpdateSchedule({
			user: user
		}, cb);
	}, 2);

	processingQueue.drain = function() {
		logger.info('All users have been processed. Scheduling next execution in 30 minutes.');
	};

	//User.findOne(credentials).populate('schedule').exec( function(err, user) {
	User.find().exec(function(err, users) {
		if(err) {
			logger.error('Cannot enumerate users.');
			return;
		}
		if( users.length === 0) {
			logger.info('No users to scan for updates.');
			return;
		}
		logger.info('Scanning %d users for updates of planning.', users.length);
		processingQueue.push(users, function(err) {
			if(err) {
				logger.error(err);
				return;
			}
		});
		//Push.sendNotification(users[0], 'line 1', 'line 2');
	});

}

process.on('SIGINT', function() {
	dispose(function () {
    	logger.info('Database connection disconnected due to app termination.');
    	process.exit(0);
	});
});

init(appStart);
