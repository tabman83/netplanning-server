var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ScheduleItemSchema   = new Schema({
	user:		{ type: Schema.Types.ObjectId, ref: 'User' },
	begin:		{ type: Date, required: true },
	end:		{ type: Date, required: true },
	kind:		{ type: String, required: true },
	name:		{ type: String },
	id:			{ type: Number },
	comment:	{ type: String },
	changedOrUnchanged:	{ type: Boolean, required: true },
	addedOrCancelled:	{ type: Boolean, required: true },
	notified:			{ type: Boolean, required: true },		
});

module.exports = mongoose.model('ScheduleItem', ScheduleItemSchema);
