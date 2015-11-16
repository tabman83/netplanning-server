/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   changeItem.js
 * Created:		16/11/2015
 * Description:	Mongoose schema of a change item
 */

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ChangeItemSchema   = new Schema({
	_user:		{ type: Schema.Types.ObjectId, ref: 'User', required: true },
	begin:		{ type: Date, required: true },
	end:		{ type: Date, required: true },
	kind:		{ type: String, required: true },
	type:		{ type: Number, required: true },
	name:		{ type: String },
	id:			{ type: Number },
	reason:		{ type: String }
});

ChangeItemSchema.methods.isLesson = function() {
	return !!this.name;
};

//ChangeItemSchema.index({ user: 1, begin: 1, end: 1, kind: 1}, { unique: true });

module.exports = mongoose.model('ChangeItem', ChangeItemSchema);
