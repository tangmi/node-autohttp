// generate client code

module.exports = function(mapFns) {
	console.log(mapFns);

	var out = [
		'function go() { alert("hi there!"); };'
	];
	for (var fnName in mapFns) {
		var fn = mapFns[fnName];
		// TODO: correctly generate ajax requests and such
		out.push('var ' + fnName + ' = ' + fn.toString());
	}
	return out.join('\n');
}