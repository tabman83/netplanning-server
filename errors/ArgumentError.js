var ArgumentError = function (message) {  
    this.name = "ArgumentError";  
    this.message = message;  
}  
ArgumentError.prototype = new Error();  
ArgumentError.prototype.constructor = ArgumentError;

module.exports = ArgumentError;
