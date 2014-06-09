(function () {

	var Config = {};

	Config.uris = {
		login: "http://netplanning.telelangue.com/portal1/login.do",
		scheduleUri: "http://netplanning.telelangue.com/portal1/profs/planning.jsp;jsessionid=%s"
	}

	Config.regExes = {
		invalidLogin: /Incorrect identification/,
		sessionTimedOut: /Votre session est p/,
		successfulLogin: /home.jsp;jsessionid=([A-Z0-9]{32}\.vlbnp\d)/,
		schedule: /<td style="width:80px"\sid=\'xy\d_\d{1,2}\' xstyle="cursor:move;"\r\n\s{12}onmouseOver="setCurrentCoords\(\d,\d{1,2}\)"\r\n\s{12}onmousedown="startSelection\(\'xy\',\d,\d{1,2}\)"\r\n\s{12}debut="(\d{13})"\r\n\s{12}fin="(\d{13})"\sclass="(training|reserveRemplacement|dispo|dispo_stag2|dispo_stag|s_dispo_stag|s_dispo_stag2|reserve_stag|s_indispo2|recurrente|indispo|reserve|indispoPonctuelle)"(?:\sreserve="true")?><p\salign="center"(?:\sclass="small")?>(?:(?:\r\n\r\n\r\n\s{4}<span id="noprint"><a href="userProfile.jsp;jsessionid=[A-Z0-9]{32}.vlbnp\d\?userId=\d+?"\sonmouseover="doDisplay\('horaire\d{1,3}'\)"\s{2}onmouseout="kill\(\)"\sclass="noir">[\w\W]+?<\/a><\/span>\r\n\s{6}\r\n\s{4}<span\sid="printOnly"><strong>([\w\s]+?)<\/strong>,&nbsp;\r\n\s{8}\r\n\s{16}[\w\W]+?\r\n\s{16}<\/span>\r\n\r\n\s\r\n\r\n)|(?:\r\n\s{32}&nbsp;\s{30})|(?:&nbsp;))<\/p><\/td>/g
	}
	
	// Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Config;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return Config;
        });
    }
    // included directly via <script> tag
    else {
        this.Config = Config;
    }

}());	
