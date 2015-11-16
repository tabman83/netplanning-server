/*!
* NetPlanning Engine
* Antonino Parisi <tabman83@gmail.com>
*
* File name:	updateSchedule.js
* Created:		6/12/2014 02.06
* Description:	Updates the schedule to the database
*/

var moment          = require('moment');
var logger          = require("../logger");
var ScheduleItem    = require('../models/scheduleItem');
var ChangeItem      = require('../models/changeItem');

module.exports = function(data, remoteItems, dbItems, next) {

    var user = data.user;
    var unavailabilities = ['s_indispo2', 'dispo_stag2', 'dispo', 'indispo', 'indispoPonctuelle'];
/*
    // asynchronously delete old items
    var today = (new Date()).setHours(0,0,0,0);

    ScheduleItem.remove({
        user : user._id,
        end  : {
            $lt: today
        }
    }).exec();*/

    remoteItems.forEach(function(remoteItem) {
        // look for this remote item in the db, if it is not found then it is a new lesson
        var dbItemsFound = dbItems.filter(function(dbItem) {
            return (+dbItem.begin === +remoteItem.begin) && (+dbItem.end === +remoteItem.end);
        });
        if(dbItemsFound.length === 0) {
            ScheduleItem.create(remoteItem);
        } else if(dbItemsFound.length === 1) {
            var dbItem = dbItemsFound.pop();
            if( dbItem.kind !== remoteItem.kind) {
                logger.debug('Detected change from %s to %s.', dbItem.kind, remoteItem.kind);

                var isNew = isCancelled = false;
                var kind = name = null;
                var isOldAnUnavailability = unavailabilities.indexOf(dbItem.kind) > -1;
                var isNewAnUnavailability = unavailabilities.indexOf(remoteItem.kind) > -1;
                if(isOldAnUnavailability && !isNewAnUnavailability) {
                    isNew = true;
                    isCancelled = false;
                    kind = remoteItem.kind;
                    name = remoteItem.name;
                } else if(!isOldAnUnavailability && isNewAnUnavailability) {
                    isNew = false;
                    isCancelled = true;
                    kind = dbItem.kind;
                    name = null;
                }

                ChangeItem.create({
                    _user: dbItem._user,
                	begin: dbItem.begin,
                	end: dbItem.end,
                    isItemNew: isNew,
                    isItemCancelled: isCancelled,
                    kind: kind,
                	name: name
                }, function(err) {
                    dbItem.kind = remoteItem.kind;
                    dbItem.name = remoteItem.name;
                    dbItem.save();
                });
            }
        } else {
            var err = new Error('Duplicate item found.');
            next(err);
            return false;
        }
    });

    next(null, data);
}
