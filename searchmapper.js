var _ = require("underscore"),
	moment = require('moment');

function getPublicTransportationStops(stop, client, callback) {
	client.get("/ReisRest/Place/GetLines/" + stop.ID, function(err, req, res, obj) {
		callback({
			id: stop.ID,
			name: stop.Name,
			district: stop.District,
			lines: _.map(obj, function(line) {
				return {
					id: line.LineID,
					name : line.LineName,
					type : line.Transportation
				}
			})
		});
	});
}

function getNextDepartures(stopId, line, client, callback) {
	client.get("/ReisRest/RealTime/GetAllDepartures/" + stopId, function(err, req, res, obj) {
		callback(_.map(_.first(_.where(obj, { LineRef: line }), 5), function(departure) {
			return {
				destination: departure.DestinationDisplay,
				time: moment(departure.AimedDepartureTime).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
			}
		}));
	});
}

exports.getPublicTransportationStops = getPublicTransportationStops;
exports.getNextDepartures = getNextDepartures;