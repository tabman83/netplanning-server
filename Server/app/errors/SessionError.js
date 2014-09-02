/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   SessionError.js
 * Created:		
 * Description:	Session Error
 */

var SessionError = function (message) {
    this.name = "SessionError";
    this.message = message;
}
SessionError.prototype = new Error();
SessionError.prototype.constructor = SessionError;

module.exports = SessionError;
