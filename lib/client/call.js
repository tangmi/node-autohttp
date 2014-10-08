// denotes a single call, the %s will be replaced by the call name

// TODO: use templates (hjs?)
autohttp.{{METHOD_NAME}} = function(data, cb) {
	data = JSON.stringify(data);
	this.__call('{{METHOD_NAME}}', data, cb);
}