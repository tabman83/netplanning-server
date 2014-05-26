var Engine = module.exports;

Engine._uris = {
	login: "http://netplanning.telelangue.com/portal/login.do"
}

Engine._regexes = {
	invalidLogin: /Incorrect identification/,
	successfulLogin: /home.jsp;jsessionid=([A-Z0-9]{32})\.vlbnp/
}
