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
		if (req.url.indexOf(url) == 0) {
			// if we aren't making a call (denoted by the presence of an
			// x-autohttp-call) header field, then just server the js file.
			// otherwise, we'll use the same url as an enpoint to make our
			// fancy method calls

			if (!req.headers['x-autohttp-call']) {
				// serve the generated client file
				var body = require('./lib/gen-client')(this.__calls);
				res.writeHead(200, {
					'Content-Length': body.length,
					'Content-Type': 'application/javascript'
				});
				res.end(body);
			} else {
				readBody(req, (function(err, dataInput) {
					if (err) {
						// TODO: handle request body read error
					}

					this._handleCall(
						req.headers['x-autohttp-call'],
						dataInput,
						function(err, dataOutput) {
							// TODO: handle errs
							// console.log(req.headers);
							var errPayload;
							if (err) {
								errPayload = {
									message: err.message,
									//TODO: turn off stack by default
									stack: err.stack
								};
							}
							var body = JSON.stringify({
								err: errPayload,
								payload: JSON.stringify(dataOutput)
							});
							res.writeHead(200, {
								'Content-Length': body.length,
								'Content-Type': 'application/json'
							});
							res.end(body);
						});
				}).bind(this));
			}
		} else {
			// replay the user's listeners
			for (var i = 0; i < listeners.length; i++) {
				listeners[i].call(httpServer, req, res);
			}
		}
	}).bind(this));
};

function readBody(req, cb) {
	var chunks = [];
	req.on('data', function(chunk) {
		chunks.push(chunk);
	});
	req.on('end', function() {
		var data = Buffer.concat(chunks).toString()
		try {
			data = JSON.parse(data);
		} catch (e) {
			// TODO: more graceful error handling
			throw e;
		}
		cb(null, data);
	});
	req.on('error', function(e) {
		cb(e);
	});
}

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