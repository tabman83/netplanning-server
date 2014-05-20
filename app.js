var url = "http://netplanning.telelangue.com/portal/login.do";

var request = require('request');

var done = function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Print the google web page.
  }
};

var parameters = {
	username: "R3775",
	password: "NLCGL"
}

request.post(url, done).form(parameters);
