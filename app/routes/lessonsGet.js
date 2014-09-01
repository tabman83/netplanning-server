/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   lessonsGet.js
 * Created:		8/28/2014 16.16
 * Description:	GET /Lessons API
 */

var logger  = require("../logger");
var ScheduleItem   = require('../models/scheduleItem');

module.exports = function (req, res, next) {

    var fields = ['begin','end','kind','name','changedOrUnchanged','addedOrCancelled','notified'].join(' ');

    ScheduleItem.find({user: req.user.userId}, fields, function( err, lessons ) {
        if (err) {
            next(err);
            return;
        }
        res.json(200, { lessons: lessons });
        return;
    });
}
