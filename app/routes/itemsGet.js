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

module.exports = function (req, res, next) {

    var queryUser = User.findById(req.user.userId, 'lastCheck')
    var queryLessons = ScheduleItem.find({
        _user: req.user.userId,
        kind: { $ne: 'indispo' },
        begin: { $gte: moment().startOf('day').toDate() }
    }, null, {
        sort: { begin: 1 }
    });

    async.parallel([
        function(callback) {
            queryUser.exec(function(err, user) {
                if (err) {
                    callback(err);
                }

                callback(null, user);
            })
        },
        function(callback) {
            queryLessons.exec(function(err, lessons) {
                if (err) {
                    callback(err);
                }

                callback(null, lessons);
            })
        }
    ], function(err, results) {
        if (err) {
            next(err);
            return;
        }
        var lastCheck = results[0] ? results[0].lastCheck : new Date(0);
        var items = results[1];
        res
            .header('Access-Control-Expose-Headers', 'last-check')
            .header('last-check', lastCheck)
            .status(200)
            .json(items);
        return;
    });
}
