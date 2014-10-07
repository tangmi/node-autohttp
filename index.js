function AutoHttp(httpServer) {
	// make sure we're an instance
	if (!(this instanceof AutoHttp)) return new AutoHttp(httpServer);

	this.attach(httpServer);
	this.__calls = {};
}

AutoHttp.prototype.attach = function(httpServer) {
	// attach generated js to server
	var url = '/autohttp.js';
	var listeners = httpServer.listeners('request').slice(0);
	httpServer.removeAllListeners('request');
	httpServer.on('request', (function(req, res) {


		if (0 == req.url.indexOf(url)) {
			if (!req.headers['x-autohttp-call']) {
				this._serveJs(res);
			} else {
				// console.log(req);

				// TODO: GET THE BODY OUT OF THE REQUEST!!!!!
				var dataInput = "hi there";

				this._handleCall(
					req.headers['x-autohttp-call'],
					dataInput,
					function(err, dataOutput) {
						// TODO: handle errs
						// console.log(req.headers);

						var body = JSON.stringify({
							err: err,
							payload: JSON.stringify(dataOutput)
						});
						res.writeHead(200, {
							'Content-Length': body.length,
							'Content-Type': 'application/json'
						});
						res.end(body);
					});
			}
		} else {
			for (var i = 0; i < listeners.length; i++) {
				listeners[i].call(httpServer, req, res);
			}
		}
	}).bind(this));

};

AutoHttp.prototype._serveJs = function serve(res) {
	var body = require('./lib/gen-client')(this.__calls);
	res.writeHead(200, {
		'Content-Length': body.length,
		'Content-Type': 'application/javascript'
	});
	res.end(body);
};

AutoHttp.prototype._handleCall = function(callName, data, cb) {
	if (!this.__calls[callName]) {
		// TODO: handle this more gracefully
		console.log('%s not found in __calls', callName);
	}

	this.__calls[callName](data, cb);
}

AutoHttp.prototype.register = function(name, fn) {
	// some sanity checks
	if (typeof name !== 'string') throw new Error('function name is not a string! name=' + name);
	if (typeof fn !== 'function') throw new Error('fn is not a function! fn=' + fn);

	var whatFn = require('what').info(fn);
	if (whatFn.params.length != 2) {
		// TODO: also possible is 1 param (just the callback)
		// should i automatically pull/stuff params?
		throw new Error('autohttp expects functions to have 2 parameters (data, callback)! params=(' + whatFn.params.join(', ') + ')');
	}

	// TODO: consider to use whatFn.name??
	console.log('registerring "%s"', name);

	this.__calls[name] = fn;

	// allow chaining
	return this;
};


module.exports = AutoHttp;