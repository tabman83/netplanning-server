/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   tokens.js
 * Created:		September 1, 2014 16.05
 * Description:	Mongoose schema of a device token
 */

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TokenSchema   = new Schema({
    _user:		{ type: Schema.Types.ObjectId, ref: 'User', required: true },
    device:	    { type: String, required: true },
    uuid:	    { type: String, required: true },
    model:	    { type: String, required: true },
    version:    { type: String, required: true },
    token:      { type: String }
});

TokenSchema.index({ user: 1, uuid: 1 }, { unique: true });

module.exports = mongoose.model('Token', TokenSchema);
