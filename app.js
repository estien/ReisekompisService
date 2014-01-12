
var StopService = require("./stopService"),
	cacheHelper = require("./cacheHelper"),
	config = require("./config"),
	restify = require('restify'),
	_ = require("underscore"),
	client,
	stopService;

var routing = require('./lib/routing');

client = restify.createJsonClient({
	  url: 'http://reis.trafikanten.no',
	  version: '*'
	}
);

stopService = new StopService.StopService(client);

var server = restify.createServer();
server.use(restify.bodyParser());

routing(server);

var port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
