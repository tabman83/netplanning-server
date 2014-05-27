var InvalidLoginError = function (message) {  
    this.name = "InvalidLoginError";  
    this.message = message;  
}  
InvalidLoginError.prototype = new Error();  
InvalidLoginError.prototype.constructor = InvalidLoginError;

module.exports = InvalidLoginError;
