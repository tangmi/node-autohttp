var fs = require('fs');
var app = require('http').createServer(function(req, res) {
	// just serve our test file
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

	// potentially do some database stuff here
	setTimeout(function() {
		cb(null, data.toUpperCase());
	}, 1000);
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
	cb(new Error('hi, this is an error generated on the server!'));
});

autohttp.register('readFile', function(data, cb) {
	require('fs').readFile(__dirname + '/test-file.txt', function(err, data) {
		cb(err, data.toString());
	});
});

app.listen(3000);