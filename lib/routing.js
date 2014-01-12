
var stopResource = require('./stop/stop-resource');

module.exports = function(server) {
	
	server.get('/', stopResource.emptyResponse);
	server.get('/search/:query', stopResource.search);
	server.get('/poll/:stop/:line', stopResource.pollLine);
	server.post('/poll', stopResource.pollStops);
	
};