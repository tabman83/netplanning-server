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
var AppError        = require('../appError');
var Push			= require('../push');

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

    var newCount = 0;
    var cancelledCount = 0;
    //Push.sendNotification(users[0], 'line 1', 'line 2');

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
                    newCount++;
                } else if(!isOldAnUnavailability && isNewAnUnavailability) {
                    isNew = false;
                    isCancelled = true;
                    kind = dbItem.kind;
                    name = dbItem.name;
                    cancelledCount++;
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
            next(new AppError('Duplicate item found.'));
            return false;
        }
    });

    var text = '';
    if(newCount) {
        text += newCount + ' new lesson';
        text += newCount > 1 ? 's' : '';
        text += cancelledCount ? ' and ' : '';
    }
    if(cancelledCount) {
        text += newCount + ' cancelled';
        text += newCount ? ' lesson' : '';
        text += (!newCount && cancelledCount>1) ? 's' : '';
    }
    if(newCount || cancelledCount) {
        Push.sendNotification(user, 'NetPlanning', text);
    }

    user.lastCheck = Date.now();
    user.save(function(err) {
        if(err) {
            next(err);
            return;
        }
        next(null, data);
    });
}
