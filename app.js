var pmx = require('pmx').init({
        http          : true, // HTTP routes logging (default: true)
        errors        : true, // Exceptions loggin (default: true)
        custom_probes : true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics
        network       : true, // Network monitoring at the application level
        ports         : true, // Shows which ports your app is listening on (default: false)
        alert_enabled : true  // Enable alert sub field in custom metrics   (default: false)
});

var mongoose   		= require('mongoose');
var express			= require('express');
var apn 			= require('apn');
var async 			= require('async');
var Agenda          = require('agenda');
var logger 			= require("./app/logger");
var Engine 			= require('./app/engine');
var Routes			= require('./app/routes');
var User 			= require('./app/models/user');
var bodyParser 		= require('body-parser');
var methodOverride	= require('method-override');
var AppError		= require('./app/appError');
var app				= express();
var config 			= require('./config.json');

var pjson = require('./package.json');
logger.info('%s %s starting up.', pjson.name, pjson.version);

// PMX stuff
var pmxProbe = pmx.probe();

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

	//app.use(require('morgan')('common', { stream: logger.stream }));
    var agenda = new Agenda({db: {address: config.db_url}});
    app.locals.agenda = agenda;
    app.locals.pmxUsersCounter = pmxProbe.counter({
        name : 'Users'
    });
    User.count(function(err, count) {
        if(!err) {
            app.locals.pmxUsersCounter.reset(count);
        }
    });

	app.use(bodyParser());
	app.use(methodOverride());
	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
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

    app.use(function(req, res, next) {
        var ipAddress = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;
        if(req.user) {
            logger.info('%s - %s - %s %s - %s', req.user.username, req.user.name, req.method, req.originalUrl, ipAddress);
        } else {
            logger.info('%s %s - %s', req.method, req.originalUrl, ipAddress);
        }
		next();
	});

	var router = express.Router();
	Routes(router);

	app.use('/v1', router);

	app.use(function(err, req, res, next) {
        var ipAddress = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;
        logger.error('%s - %d - %s', err.message, err.status, ipAddress);
        return res.status(err.status || 500).json({ message: err.message });
	});

	var server = app.listen(config.port, function() {
		logger.info('Listening on %s:%d.', server.address().address, server.address().port);
	});

    agenda.define('netplanning', function(job, done) {
        var userId = job.attrs.data.userId;
        User.findById(userId, function(err, user) {
            if(err) {
                logger.info('Error processing user id %s', userId);
                done();
                return;
            }
            logger.info('%s - %s - Running netplanning website check for user.', user.username, user.name);
            Engine.loadAndUpdateSchedule({
                user: user,
                notify: true
            }, function(err) {
                if (err) {
                    next(err);
                    return;
                }
                job.schedule('in 30 minutes', { userId: user._id });
                job.save();
                logger.info('%s - %s - Website check scheduled to run again in 30 minutes.', user.username, user.name);
                done();
            });
        });
    });

    agenda.on('ready', function() {
        agenda.cancel({}, function(err, numRemoved) {
            if(err) {
                logger.error('Error while removing old jobs.', err);
                return;
            }
            User.find().exec(function(err, users) {
        		if(err) {
        			logger.error('Cannot enumerate users.');
        			return;
        		}
        		if( users.length === 0) {
        			logger.info('No users.');
        			return;
        		}
                users.forEach(function(user) {
                    logger.info('%s - %s - Creating a new job and scheduling for immediate execution.', user.username, user.name);
                    agenda.now('netplanning', { userId: user._id });
                });
        	});
            agenda.start();
        });
    });
}

process.on('SIGINT', function() {
	dispose(function () {
    	logger.info('Database connection disconnected due to app termination.');
    	process.exit(0);
	});
});

init(appStart);
