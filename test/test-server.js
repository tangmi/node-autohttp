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

autohttp.register('addKey', function(data, cb) {
	// make uppercase
	data.poop = 'poop';
	cb(null, data);
});

autohttp.register('reverse', function(data, cb) {
	// make uppercase
	cb(null, data.split('').reverse().join(''));
});

autohttp.register('throwError', function(data, cb) {
	// make uppercase
	cb(new Error('hi there'));
});

app.listen(3000);