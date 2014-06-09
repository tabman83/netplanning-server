var SessionError = function (message) {  
    this.name = "SessionError";  
    this.message = message;  
}  
SessionError.prototype = new Error();  
SessionError.prototype.constructor = SessionError;

module.exports = SessionError;
