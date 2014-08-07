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
	},
	"IT" : {
	}
}
 
module.exports = function(lang, token) {
	var stringLang = stringResources[lang];	
	if( typeof(stringLang) === undefined ) {
		return "Unknown language '"+lang+"'.";
	} else {
		var stringLangToken = stringLang[token];
		if( typeof(stringLangToken) === undefined ) {
			return "Unknown token '"+token+"' for language '"+lang+"'.";
		} else {
			return stringLangToken;
		}
	}
}
