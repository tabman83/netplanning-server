/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   lessonsGet.js
 * Created:		22 nov 2015 12.44
 * Description:	DELETE /items API
 */

var logger          = require("../logger");
var async           = require('async');
var moment          = require('moment');
var User            = require('../models/user');
var logger	    = require('../logger');
var ScheduleItem    = require('../models/scheduleItem');
var Engine 			= require('../engine');

module.exports = function (req, res, next) {

	var id = req.params.id;
	logger.info('%s - %s - Attempted remove of id %s', req.user, req.username, id);
    return res.status(400).json({ message: 'Feature not enabled yet.'});

};
