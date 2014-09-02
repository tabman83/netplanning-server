/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   UnauthorizedError.js
 * Created:		8/29/2014 21.08
 * Description:	Unauthorized Error
 */

function UnauthorizedError (code, error) {
    Error.call(this, error.message);
    this.name = "UnauthorizedError";
    this.message = error.message;
    this.code = code;
    this.status = 401;
    this.inner = error;
}

UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;

module.exports = UnauthorizedError;
