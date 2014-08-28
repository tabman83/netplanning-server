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
var winstonStream = {
    write: function(message, encoding){
        winston.info(message);
    }
};

console.log("Application "+process.env.npm_package_name+" "+process.env.npm_package_version+" start up");

var mongoose   		= require('mongoose');
var helpers 		= require('./app/helpers');
var Engine 			= require('./app/engine');
var Routes			= require('./app/routes');
var User 			= require('./app/models/user');
var express			= require('express');
var bodyParser		= require('body-parser');
var methodOverride	= require('method-override');
var morgan  		= require('morgan');
var apn 			= require('apn');
var app				= express();


var apnConnection = null;

// initializes app and create resources
var init = function(callback) {
	var options = {
		cert: 'certs/prod/cert.pem',
		key: 'certs/prod/key.pem',
		production: true
	};
	apnConnection = new apn.Connection(options);

	mongoose.connection.on("open", function(ref) {
		console.log("Database connection successfully established");
		callback();
	});
	mongoose.connection.on("error", function(err) {
		console.error("Database connection failed", err);
	});
	mongoose.connect(process.env.npm_package_config_dbUrl);
}

var dispose = function(callback) {
	apnConnection.shutdown();
	mongoose.connection.close(callback);
}

var appStart = function() {

	app.use(morgan({
		format: process.env.npm_package_config_logLevel,
		stream: winstonStream
	}));

	app.use(bodyParser());
	app.use(methodOverride());

	//app.use(ninoAuth({ secret: process.env.npm_package_config_secret, skip: ['/auth']}));
	var router = express.Router();
	Routes(router); // routes(router,jwt)
	app.use('/v1', router );

	app.use(function(err, req, res, next){
	  	if(err) {
	  		console.log('Server error: '+err.message);
	  		res.send(500, 'Internal server error.');
		}
	});

	var server = app.listen(process.env.npm_package_config_port, process.env.npm_package_config_hostName, function() {
		console.log('Listening on %s %s:%d', process.env.npm_package_config_hostName, server.address().address, server.address().port);
	});


	var credentials = {
		username:"R3775",
		password:"NLCGL"
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

	User.findOne(credentials, function(err, user) {

		var data = {
			user: user,
			apnConnection: apnConnection
		};

		Engine.loadAndUpdateSchedule( data, function(err, data) {
			if(err) {
				console.log('User '+user.username+': error occurred ('+String(err)+')');
			} else {
				console.log('User '+user.username+': Done.');
			}

			dispose(function () {
				console.log('Database connection disconnected');
			});
		});
	});

}

process.on('SIGINT', function() {
	dispose(function () {
    	console.log('Database connection disconnected through app termination');
    	process.exit(0);
	});
});

init( appStart );
