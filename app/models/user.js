/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   user.js
 * Created:		May 2014
 * Description:	Mongoose schema of an user
 */

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	username:	{ type: String, index: true, required: true, unique: true },
	name:		{ type: String, required: true },
	password:	{ type: String, index: true, required: true },
	joinDate:	{ type: Date, default: Date.now },
	lastLogin:	{ type: Date, default: 0 },
	lastCheck:	{ type: Date, default: 0 },
	sessionId:	{ type: String },
	language:	{ type: String, default: 'EN' }
});

UserSchema.index({username: 1, password: 1});

module.exports = mongoose.model('User', UserSchema);
