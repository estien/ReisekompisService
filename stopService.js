var _ = require("underscore"),
	moment = require('moment');


var StopService = function(client) {
	var self = this;

	self.client = client;

	self.findStops = function (query, cacheHelper, callback) {
		self.client.get("/ReisRest/Place/Autocomplete/" + query , function(err, req, res, foundStops) {

			if (!foundStops.length) {
				callback([]);
			}
			
			var stops = [];
			var numberOfReturnedStops = 0;
			_.each(foundStops, function(stop) {

				function stopWithLines(stopWithLines) {
					if (stopWithLines.lines.length) {
						stops.push(stopWithLines);
					}
					if (++numberOfReturnedStops === foundStops.length) {
						callback(stops);
					}
				}

				cacheHelper.get({
					key: "stop:" + stop.ID,
					getter: function(callback) {
						getStopWithLines(stop, callback);
					},
					callback: stopWithLines
				})
			});
		});
	}

	self.getNextDepartures = function (stopId, lines, callback) {
		
		function filterDesired(departure) {
			return _.contains(lines, departure.LineRef);
		}

		self.client.get("/ReisRest/RealTime/GetAllDepartures/" + stopId, function(err, req, res, departures) {

			callback(_.map(_.filter(departures, filterDesired), function(departure) {
				return {
					id : parseInt(departure.LineRef, 10),
					stopId : parseInt(stopId, 10),
					destination: departure.DestinationDisplay,
					time: moment(departure.AimedDepartureTime).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
				}
			}));

		});
	}

	function getStopWithLines(stop, callback) {
		self.client.get("/ReisRest/Place/GetLines/" + stop.ID, function(err, req, res, lines) {

			callback({
				id: stop.ID,
				name: stop.Name,
				district: stop.District,
				lines: _.map(lines, function(line) {
					return {
						id: line.LineID,
						name : line.LineName,
						type : line.Transportation
					}
				})
			});
		});
	}

	
}

exports.StopService = StopService;