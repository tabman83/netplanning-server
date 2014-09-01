/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   LoginError.js
 * Created:
 * Description:	Login Error
 */

var LoginError = function (message) {
    this.name = "LoginError";
    this.message = message;
}
LoginError.prototype = new Error();
LoginError.prototype.constructor = LoginError;

module.exports = LoginError;
