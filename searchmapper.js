var _ = require("underscore"),
	moment = require('moment');

function getLines(stop, client, callback) {
	client.get("/ReisRest/Place/GetLines/" + stop.ID, function(err, req, res, obj) {
		callback({
			name: stop.Name,
			district: stop.District,
			stopId: stop.ID,
			lines: _.map(obj, function(line) {
				return {
					id: line.LineID,
					name : line.LineName,
					trans : line.Transportation
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

exports.getLines = getLines;
exports.getNextDepartures = getNextDepartures;