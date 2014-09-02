/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   InvalidLoginError.js
 * Created:
 * Description:	Invalid login Error
 */

var InvalidLoginError = function (message) {
    this.name = "InvalidLoginError";
    this.message = message;
}
InvalidLoginError.prototype = new Error();
InvalidLoginError.prototype.constructor = InvalidLoginError;

module.exports = InvalidLoginError;
