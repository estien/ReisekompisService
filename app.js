require("./config")
var searchmapper = require("./searchmapper"),
	cacheHelper = require("./cacheHelper"),
	restify = require('restify'),
	_ = require("underscore"),
	client;

function search(request, response, next) {
	var query = (request.params.query || "").toLowerCase();
	console.log("Searching for " + query + "...");

	function returnResponse(lines) {
		response.send(lines);
		return next();
	}

	function findStops(callback) {
		var encodedSearchQuery = encodeURIComponent(query);
		client.get("/ReisRest/Place/Autocomplete/" + encodedSearchQuery , function(err, req, res, obj) {
			if (!obj.length) {
				callback(obj);
			}
			var lines = [];
			var numberOfReturnedLines = 0;
			_.each(obj, function(stop) {
				searchmapper.getLines(stop, client, function(linesForStop) {
					if (linesForStop.lines.length) {
						lines.push(linesForStop);
					}
					if (++numberOfReturnedLines === obj.length) {
						callback(lines);
					}
				});
			});
		});
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

function poll(request, response, next) {
	var stopId = request.params.stop,
		line = request.params.line;
	searchmapper.getNextDepartures(stopId, line, client, function(departures) {
		response.send(departures);
		return next();
	});
}


client = restify.createJsonClient({
  url: 'http://reis.trafikanten.no',
  version: '*'
});

var server = restify.createServer();
server.get('/search/:query', search);
server.get('/poll/:stop/:line', poll);

server.listen(80, function() {
  console.log('%s listening at %s', server.name, server.url);
});
