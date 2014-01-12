var stopService = require('./stop-service');

exports.search = function (request, response, next) {
	
	var query = (request.params.query || "").toLowerCase();
	console.log("Searching for " + query + "...");
	
	stopService.search(query, function(err, stops) {
		
		if(err) {
			response.send([]);
		}
		else {
			response.send(stops);
		}
		return next();
	});
	
}

exports.pollLine = function (request, response, next) {
	var stopId = parseInt(request.params.stop || "0"),
		line = request.params.line;
	stopService.getNextDepartures(stopId, [line], function(departures) {
		response.send(departures);
		return next();
	});
}

exports.pollStops = function (request, response, next) {
	
	var stops = JSON.parse(request.body || []);
	if(!stops.length)  {
		response.send([]);
		return next();
	}
		
	stopService.getNextDeparturesForStops(stops, function(err, departures) {
		response.send(departures);
		return next();
	});
}

exports.emptyResponse = function (request, response, next) {
	response.send("Hei reisekompis!");
	return next();
}