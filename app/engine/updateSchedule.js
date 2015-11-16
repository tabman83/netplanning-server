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
            remoteItem.type = 1;
            ChangeItem.create(remoteItem);
            ScheduleItem.create(remoteItem);
        } else if(dbItemsFound.length === 1) {
            var dbItem = dbItemsFound.pop();
            if( dbItem.kind !== remoteItem.kind && remoteItem.kind !== 's_indispo2') {
                dbItem.kind = remoteItem.kind;
                dbItem.save();
                dbItem.type = +dbItem.isLesson();
                ChangeItem.create(dbItem);
            }
        } else {
            var err = new Error('Duplicate item found.');
            next(err);
            return false;
        }
    });

    dbItems.forEach(function(dbItem) {
        // look for this db item among the remote ones, if it is not found then it is a cancelled lesson
        var remoteItemsFound = remoteItems.filter(function(remoteItem) {
            return (+dbItem.begin === +remoteItem.begin) && (+dbItem.end === +remoteItem.end);
        });
        if(remoteItemsFound.length === 0) {
            dbItem.type = 0;
            ChangeItem.create(dbItem);
            dbItem.remove();
        } else if(remoteItemsFound.length === 1) {
            var remoteItem = remoteItemsFound.pop();
            if( remoteItem.kind !== dbItem.kind && remoteItem.kind !== 's_indispo2' ) {
                dbItem.kind = remoteItem.kind;
                dbItem.save();
                dbItem.type = +dbItem.isLesson();
                ChangeItem.create(dbItem);
            }
        } else {
            var err = new Error('Duplicate item found.');
            next(err);
            return false;
        }
    });

    next(null, data);
}
