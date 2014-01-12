var cache = require('memory-cache');

exports.get = function(options) {
	var item = cache.get(options.key);
	if(item) {
		options.callback(null, item)
	}
	else {
		var time = options.time || 30 * 60000; // 30 min default
		options.getter(function(err, item) {
			cache.put(options.key, item, time);
			options.callback(null, item)
		});
	}
}
