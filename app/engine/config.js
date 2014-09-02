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
    	scheduleUserId: /userProfile.jsp;jsessionid=[A-Z0-9]{32}\.vlbnp\d\?userId=(\d+)"/,
    	scheduleName: /<strong>(.+?)<\/strong>/,
    	scheduleReason: /<a\shref="#"\sonmouseover="doDisplay\(&#x27;horaire\d{3}&#x27;\)"\sonmouseout="kill\(\)">(.+)<\/a>/
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
