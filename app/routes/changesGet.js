/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   lessonsGet.js
 * Created:		8/28/2014 16.16
 * Description:	GET /Lessons API
 */

var logger          = require("../logger");
var async           = require('async');
var moment          = require('moment');
var User            = require('../models/user');
var ScheduleItem    = require('../models/changeItem');

module.exports = function (req, res, next) {

    ChangeItem.find({
        _user: req.user.userId
    }, null, {
        sort: { begin: 1 }
    }, function(err, items) {
        if (err) {
            next(err);
            return;
        }
        res.status(200).json(items);
    });
    
}
