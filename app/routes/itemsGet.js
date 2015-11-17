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
var ScheduleItem    = require('../models/scheduleItem');
var Engine 			= require('../engine');

module.exports = function (req, res, next) {

    function getItems(user) {
        ScheduleItem.find({
            _user: req.user.userId,
            kind: { $ne: 'indispo' },
            begin: { $gte: moment().startOf('day').toDate() }
        }, null, {
            sort: { begin: 1 }
        }, function(err, items) {
            if (err) {
                next(err);
                return;
            }
            res
                .header('Access-Control-Expose-Headers', 'last-check')
                .header('last-check', user.lastCheck)
                .status(200)
                .json(items);
        });
    }

    User.findById(req.user.userId).then(function(user) {

        if(req.query.force) {
            Engine.loadAndUpdateSchedule({
                user: user
            }, function(err) {
                if (err) {
                    next(err);
                    return;
                }
                getItems(user);
            });
        } else {
            getItems(user);
        }

    });
}
