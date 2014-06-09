/*!
 * NetPlanning Helpers
 * Antonino Parisi <tabman83@gmail.com>
 *
 */
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var helpers = {
    };
    
/*    
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};
*/    
    helpers.difference = function(a, b, fields) {
    
    	return a.filter( function(aEl) {
    	
    		return b.filter( function(bEl) {
			
    		
    			var condition = true;
    			fields.forEach( function( field ) {
    				condition &= (aEl[field] === bEl[field]);
				} );
				return condition;    		
    		
    		}).length === 0;
    	
    	});
    
    }
    
    

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = helpers;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return helpers;
        });
    }
    // included directly via <script> tag
    else {
        this.helpers = helpers;
    }

}());
