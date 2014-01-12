var _ = require('underscore'),
	async = require('async'), 
	cacheHelper = require('./../cache-helper'),
	stopRepository = require('./stop-repository'),
	config = require('./../config');

var getStopsWithLines = function(foundStops, callback) {
	
	var tasks = [];
	_.each(foundStops, function(stop) {
		
		tasks.push(function(callback) {
			
			cacheHelper.get({
				key: "stop:" + stop.ID,
				getter: function(callback) {
					stopRepository.getDetailedStop(stop, callback);
				},
				callback: callback
			});
		});
	});
	
	async.parallel(tasks, function(err, results) {
		var stops = [];
		_.each(results, function(stop) {
			if(stop && stop.lines.length) {
				stops.push(stop);
			}
		});
		
		callback(null, stops);
	});
};

exports.search = function(query, callback) {
	
	query = encodeURIComponent(query.toLowerCase());

	if(!query || query.length < 4) {
		callback(null , []);
		return;
	}

	cacheHelper.get({
		key : "autocomplete:" + query,
		getter : function(callback) {
			stopRepository.search(query, function(err, stops) {
				getStopsWithLines(stops, callback);
			});
		},
		callback : callback
		//, time : 3000 // sets 3 seconds cache period for debugging purposes
	});
	
};


var getNextDepartures = exports.getNextDepartures = function (stopId, lines, callback) {
	stopRepository.getNextDepartures(stopId, lines, callback);
};

exports.getNextDeparturesForStops = function(stops, callback) {
		
	var tasks = [];
	
	_.each(stops, function(stop) {
		
		var linesAsStrings = _.map(stop.lines, function(line) { return line + ""; });
		tasks.push(function(callback) {
			getNextDepartures(stop.id, linesAsStrings, callback);
		});
	});
	
	async.parallel(tasks, function(err, results) {
			
		var lines = {};

		_.chain(results)
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

		callback(null, finalResult);
		
	});
	
};