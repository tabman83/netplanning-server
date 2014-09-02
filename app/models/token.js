/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   tokens.js
 * Created:		9/1/2014 16.05
 * Description:	Mongoose schema of a device token
 */

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TokenSchema   = new Schema({
    user:		{ type: Schema.Types.ObjectId, ref: 'User', required: true },
    deviceType:	{ type: Number, required: true },
    value:      { type: String, required: true }
});

TokenSchema.index({ user: 1, deviceType: 1, value: 1}, { unique: true });

module.exports = mongoose.model('Token', TokenSchema);
