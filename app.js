require("./config")
var StopService = require("./stopService"),
	cacheHelper = require("./cacheHelper"),
	restify = require('restify'),
	_ = require("underscore"),
	client,
	stopService;

function search(request, response, next) {
	var query = (request.params.query || "").toLowerCase();
	console.log("Searching for " + query + "...");

	function returnResponse(stops) {
		response.send(stops);
		return next();
	}

	function findStops(callback) {
		var encodedSearchQuery = encodeURIComponent(query);
		stopService.findStops(encodedSearchQuery, cacheHelper, callback);
	}




	if(!query || query.length < 4) {
		returnResponse([]);
		return;
	}

	cacheHelper.get({
		key : "autocomplete:" + query,
		getter : findStops,
		callback : returnResponse
		//, time : 3000 // sets 3 seconds cache period for debugging purposes
	});
}

function pollLine(request, response, next) {
	var stopId = request.params.stop,
		line = request.params.line;
	stopService.getNextDepartures(stopId, [line], function(departures) {
		response.send(departures);
		return next();
	});
}

function pollStops(request, response, next) {
	
	var stops = JSON.parse(request.body || []);
	if(!stops.length)  {
		response.send([]);
		return next();
	}

	var result = [], numberOfStops = stops.length;
	for(var i = 0; i < numberOfStops; i++) {
		var stop = stops[i], numberOfReturnedStops = 0;
		var linesAsStrings = _.map(stop.lines, function(line) { return line + ""; });
		stopService.getNextDepartures(stop.id + "", linesAsStrings, function(departures) {

			result.push(departures);

			if (++numberOfReturnedStops === numberOfStops) {
				response.send(_.flatten(result));
				return next();
			}
		});
	}
}

function emptyResponse(request, response, next) {
	response.send("Hei reisekompis!");
	return next();
}


client = restify.createJsonClient({
  url: 'http://reis.trafikanten.no',
  version: '*'
}
);

stopService = new StopService.StopService(client);

var server = restify.createServer();

server.get('/', emptyResponse);
server.get('/search/:query', search);
server.get('/poll/:stop/:line', pollLine);

server.use(restify.bodyParser());
server.post('/poll', pollStops);

var port = process.env.PORT || 8080;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
