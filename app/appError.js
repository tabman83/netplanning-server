/*!
 * NetPlanning Engine
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	appErrpr.js
 * Created:		18/11/2015
 * Description:	Application error
 */

var AppError = function (status, message) {
    if(typeof(status) === 'string') {
        this.status = 500;
        this.message = status;
    } else {
        this.status = status;
        this.message = message;
    }
}
AppError.prototype = new Error();
AppError.prototype.constructor = AppError;

module.exports = AppError;
