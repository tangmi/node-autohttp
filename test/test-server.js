var fs = require('fs');
var app = require('http').createServer(function(req, res) {
	var file = fs.readFileSync(__dirname + '/test.html');
	res.writeHead(200, {
		'Content-Length': file.length,
		'Content-Type': 'text/html'
	});
	res.end(file);
});

var autohttp = require('..')(app);

autohttp.register('capitalize', function(data, cb) {
	// make uppercase
	cb(null, data.toUpperCase());
});

app.listen(3000);