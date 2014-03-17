var _ = require('underscore'),
	moment = require('moment');

var request = require('restify').createJsonClient({
	  url: 'http://api.ruter.no',
	  version: '*'
	}
);

exports.search = function(query, callback) {
	
	request.get("/ReisRest/Place/Autocomplete/" + query , function(err, req, res, stops) {
		
		if(err)  {
			callback(err, null);
			return;
		}
		
		callback(null, stops);
	});
};

exports.getDetailedStop = function(stop, callback) {
	request.get("/ReisRest/Place/GetLines/" + stop.ID, function(err, req, res, lines) {

		callback(null, {
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
};


exports.getNextDepartures = function(stopId, lines, callback) {
	
	function filterDesired(departure) {
		return _.contains(lines, departure.LineRef);
	};
	
	request.get("/ReisRest/RealTime/GetAllDepartures/" + stopId, function(err, req, res, departures) {

		callback(null, _.map(_.filter(departures, filterDesired), function(departure) {
			return {
				id : parseInt(departure.LineRef, 10),
				stopId : stopId,
				destination: departure.DestinationDisplay,
				time: moment(departure.AimedDepartureTime).format("YYYY-MM-DDTHH:mm:ssZ")
			}
		}));

	});	
};