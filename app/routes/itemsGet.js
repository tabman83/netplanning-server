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

    function getItems() {
        ScheduleItem.find({
            _user: req.user._id,
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
                .header('last-check', req.user.lastCheck)
                .status(200)
                .json(items);
        });
    }

    var force = (req.query.force.toLowerCase() === 'true');
    if(force) {
        // cancel job
        var agenda = req.app.locals.agenda;
        agenda.jobs({
            name: 'netplanning',
            'data.userId': req.user._id
        }, function(err, jobs) {
            var job = jobs[0];
            job.schedule('in 30 minutes', { userId: req.user._id });
            job.save();
            var scheduledWhen = moment().add(30, 'minutes').format('LT');
            logger.info('%s - %s - Website check rescheduled to run again at %s.', req.user.username, req.user.name, scheduledWhen);
        });
        Engine.loadAndUpdateSchedule({
            user: req.user,
            notify: false
        }, function(err) {
            if (err) {
                next(err);
                return;
            }
            // reschedule job
            getItems();
        });
    } else {
        getItems();
    }
}
