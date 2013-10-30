var cache = require('memory-cache');

exports.get = function(options) {
	var item = cache.get(options.key);
	if(item) {
		options.callback(item)
	}
	else {
		var time = options.time || 30 * 60000; // 30 min default
		options.getter(function(item) {
			cache.put(options.key, item, time);
			options.callback(item)
		});
	}
}
