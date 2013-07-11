var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
	var buffer = new Buffer(fs.readFileSync('index.html'));
	var hello = buffer.toString();
	response.send(hello);
//  response.send('Hello World! Once again!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});