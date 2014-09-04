/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	loadAndUpdateSchedule.js
 * Created:		9/1/2014 17.24
 * Description:	Load lessons schedule
 */

var async = require('async');

module.exports = function(data, next) {

    var fnStartup = function(next) {
        next( null, data );
    }

    async.waterfall([
        fnStartup,
        require('./loginIfNeeded'),
        require('./loadNetSchedule'),
        require('./loadDbSchedule'),
        require('./updateSchedule')
        //require('./notifyChanges')
    ], next);

}
