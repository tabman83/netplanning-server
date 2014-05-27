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
		schedule: /<td style="width:80px"\sid=\'xy\d_\d{1,2}\' xstyle="cursor:move;"\r\n\s{12}onmouseOver="setCurrentCoords\(\d,\d{1,2}\)"\r\n\s{12}onmousedown="startSelection\(\'xy\',\d,\d{1,2}\)"\r\n\s{12}debut="(\d{13})"\r\n\s{12}fin="(\d{13})"\sclass="(s_indispo2|recurrente|indispo|reserve|indispoPonctuelle)"(?:\sreserve="true")?><p align="center">\r\n\r\n\r\n\s{4}<span id="noprint"><a href="userProfile.jsp;jsessionid=[A-Z0-9]{32}\.vlbnp\d\?userId=(\d{7})"\sonmouseover="doDisplay\('horaire\d{3}'\)"\s{2}onmouseout="kill\(\)" class="noir">\w+?<\/a><\/span>\r\n\s{6}\r\n\s{4}<span id="printOnly"><strong>(.+?)<\/strong>/g
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
