/*!
 * NetPlanning
 * Antonino Parisi <tabman83@gmail.com>
 *
 * File name:	strings.js
 * Created:		8/5/2014 00.18
 * Description:	Localization strings
 */


var stringResources = {
	"EN": {
		notificationNewLessons: 			'You have %d new lessons',
		notificationCancelledLessons: 		'%d lessons have been cancelled',
		notificationNewCancelledLessons: 	'You have %d new lessons and %d cancelled'
	},
	"IT" : {
		notificationNewLessons: 			'Ci sono %d nuove lezioni',
		notificationCancelledLessons: 		'%d lezioni sono state annullate',
		notificationNewCancelledLessons: 	'Ci sono %d lezioni nuove e %d annullate'
	}
}

module.exports = function(lang, token) {

	var util = require('util');
	var args = Array.prototype.slice.call(arguments);

	var lang = lang || 'EN';
	var stringLang = stringResources[lang];
	if( typeof(stringLang) === 'undefined' ) {
		return "Unknown language '"+lang+"'.";
	} else {
		var stringLangToken = stringLang[token];
		if( typeof(stringLangToken) === 'undefined' ) {
			return "Unknown token '"+token+"' for language '"+lang+"'.";
		} else {
			return util.format(stringLangToken,args.slice(2));
		}
	}
}
