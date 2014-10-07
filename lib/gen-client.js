// generate client code

module.exports = function(mapFns) {
	var out = [
		require('fs').readFileSync(__dirname + '/client/common.js'),
	];
	var tmpl = require('fs').readFileSync(__dirname + '/client/call.js').toString();

	for (var fnName in mapFns) {
		console.log('generating code for %s', fnName);
		var fn = mapFns[fnName];
		out.push(tmpl.replace(/\{\{METHOD_NAME\}\}/g, fnName));
	}

	// TODO: cache this
	return out.join('\n');
}