var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	username:	{ type: String, index: true, required: true, unique: true },
	password:	{ type: String, index: true, required: true },
	joinDate:	{ type: Date, default: Date.now },
	lastLogin:	{ type: Date, default: 0 },
	lastCheck:	{ type: Date },
	sessionId:	{ type: String },
	apple:		{ type: String },
	google:		{ type: String },
	winPhone:	{ type: String },
	schedule:	[{ type: Schema.Types.ObjectId, ref: 'ScheduleItem' }]
});

UserSchema.index({username: 1, password: 1});

module.exports = mongoose.model('User', UserSchema);
