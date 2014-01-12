exports.search = function (request, response, next) {
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

exports.pollLine = function (request, response, next) {
	var stopId = request.params.stop,
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

	var result = [], numberOfStops = stops.length;
	for(var i = 0; i < numberOfStops; i++) {
		var stop = stops[i], numberOfReturnedStops = 0;
		var linesAsStrings = _.map(stop.lines, function(line) { return line + ""; });
		stopService.getNextDepartures(stop.id + "", linesAsStrings, function(departures) {

			result.push(departures);

			if (++numberOfReturnedStops === numberOfStops) {

				var lines = {};

				_.chain(result)
					.flatten()
					.sortBy(function(departure) { return departure.time; })
					.each( function(line) {
						var lineKey = line.id + "";
						if(!lines[lineKey])  lines[lineKey] = [];
						if(lines[lineKey].length < config.numDeparturesPerLine) lines[lineKey].push(line);
					});

				var finalResult = _.chain(lines)
									.map(function(line) { return line; })
									.flatten()
									.sortBy(function(line) { return line.time; }).value();

				response.send(finalResult);
				return next();
			}
		});
	}
}

exports.emptyResponse = function (request, response, next) {
	response.send("Hei reisekompis!");
	return next();
}