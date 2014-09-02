/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:    scheduleItem.js
 * Created:		May 2014
 * Description:	Mongoose schema of a schedule item
 */

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ScheduleItemSchema   = new Schema({
	user:		{ type: Schema.Types.ObjectId, ref: 'User', required: true },
	begin:		{ type: Date, required: true },
	end:		{ type: Date, required: true },
	kind:		{ type: String, required: true },
	name:		{ type: String },
	id:			{ type: Number },
	reason:		{ type: String },
	changedOrUnchanged:	{ type: Boolean, required: true },
	addedOrCancelled:	{ type: Boolean, required: true },
	notified:			{ type: Boolean, required: true }
});

ScheduleItemSchema.index({ user: 1, begin: 1, end: 1}, { unique: true });

module.exports = mongoose.model('ScheduleItem', ScheduleItemSchema);
