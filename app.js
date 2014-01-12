
var restify = require('restify'),
	routing = require('./lib/routing');

var server = restify.createServer();
server.use(restify.bodyParser());

routing(server);

var port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});