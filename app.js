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

var mongoose   = require('mongoose');
var helpers = require('./app/helpers');
var Engine = require('./app/engine');
var User = require('./app/models/user');
var express		= require('express');
var morgan  		= require('morgan');
var app			= express();

var start = function() {
/*
	app.use(morgan({
		format: process.env.npm_package_config_logLevel,
		stream: winstonStream
	}));

	app.use(bodyParser());
	app.use(methodOverride());

	app.use(ninoAuth({ secret: process.env.npm_package_config_secret, skip: ['/auth']}));
	var router = express.Router();
	routes(router,jwt,winston);
	app.use('/v1', router );

	app.use(function(err, req, res, next){
	  	if(err) {
	  		console.log('Server error: '+err.message);
	  		res.send(500, 'Internal server error.');
		}
	});

	var server = app.listen(process.env.npm_package_config_port, process.env.npm_package_config_hostName, function() {
		console.log('Listening on %s %s:%d', process.env.npm_package_config_hostName, server.address().address, server.address().port);
	});*/


	var credentials = {
		username:"R3775",
		password:"NLCGL"
	};
	
	User.findOne(credentials, function(err,user) {

		Engine.loadAndUpdateSchedule( user, function(err, user) {
			if(err) {
				console.log('User '+user.username+': error occurred ('+String(err)+')');
			} else {
				console.log('User '+user.username+': Done.');
			}
	
			mongoose.disconnect();
		});
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
