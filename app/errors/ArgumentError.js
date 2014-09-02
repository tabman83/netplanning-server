/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   ArgumentError.js
 * Created:
 * Description:	Argument Error
 */

var ArgumentError = function (message) {
    this.name = "ArgumentError";
    this.message = message;
}
ArgumentError.prototype = new Error();
ArgumentError.prototype.constructor = ArgumentError;

module.exports = ArgumentError;
