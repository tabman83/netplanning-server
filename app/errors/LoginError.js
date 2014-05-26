var LoginError = function (message) {  
    this.name = "LoginError";  
    this.message = message;  
}  
LoginError.prototype = new Error();  
LoginError.prototype.constructor = LoginError;

module.exports = LoginError;
