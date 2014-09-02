/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   SignatureError.js
 * Created:		8/29/2014 21.05
 * Description:	Signature Error
 */

function SignatureError (code, error) {
    Error.call(this, error.message);
    this.name = "SignatureError";
    this.message = error.message;
    this.code = code;
    this.status = 401;
    this.inner = error;
}

SignatureError.prototype = Object.create(Error.prototype);
SignatureError.prototype.constructor = SignatureError;

module.exports = SignatureError;
