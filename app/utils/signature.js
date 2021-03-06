/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:   signature.js
 * Created:		8/29/2014 21.05
 * Description:	API routes
 */

var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var logger = require('../logger');
var AppError = require('../appError');

module.exports = function(options) {

    if (!options || !options.secret) {
		throw new AppError('Secret should be set.');
	}

	return function(req, res, next) {
    	var token;
        if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
            for (var ctrlReqs = req.headers['access-control-request-headers'].split(','),i=0;i < ctrlReqs.length; i++) {
    			if (ctrlReqs[i].indexOf('authorization') !== -1) {
    				return next();
    			}
    		}
    	}

    	if (req.headers && req.headers.signature) {
        	var data = JSON.stringify(req.body);
        	var signature = crypto.createHmac('md5', options.secret).update(data).digest('hex');

        	if( req.headers.signature !== signature ) {
                logger.info('Expected signature was: %s', signature);
        		return next(new AppError(401, 'The signature verification for this message has failed.'));
        	}
    	} else {
    		return next(new AppError(401, 'Signature is missing for this message.'));
    	}

        if (typeof options.skip !== 'undefined') {
      		if (options.skip.indexOf(req.url) > -1) {
        		return next();
      		}
    	}

    	if (req.headers && req.headers.authorization) {
      		var parts = req.headers.authorization.split(' ');
          	if (parts.length == 2) {
            	var scheme = parts[0], credentials = parts[1];
            	if (/^Bearer$/i.test(scheme)) {
              		token = credentials;
            	}
          	} else {
            	return next(new AppError(401, 'Format is Authorization: Bearer [token].'));
          	}
    	} else {
    		return next(new AppError(401, 'No Authorization header was found.'));
        }

        jwt.verify(token, options.secret, options, function(err, decoded) {
            if (err) {
                next(new AppError(401, 'Invalid token.'));
                return;
            }
      		req.decoded = decoded;
          	next();
    	});

    };

};
