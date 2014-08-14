/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var log = log4javascript.getLogger('gpxViewer.models');



function mergeStats(s1, s2) {
	log.debug("_compareStats");
	var s = {};

	s.eleMin = nullableMin(s1.eleMin, s2.eleMin);
	s.eleMax = nullableMax(s1.eleMax, s2.eleMax);

	if (!s1.eleRise) {
		s1.eleRise = 0;
	}
	s.eleRise = s1.eleRise + s2.eleRise;

	s.timeMin = nullableMin(s1.timeMin, s2.timeMin);
	s.timeMax = nullableMax(s1.timeMax, s2.timeMax);

	if (s1.distance && s2.distance) {
		s.distance = s1.distance + s2.distance;
	}
	else if (s1.distance) {
		s.distance = s1.distance;
	}
	else if (s2.distance) {
		s.distance = s2.distance;
	}

	return s;
}





function Point(lat, lon, ele) {
	this.lat = lat || 0;
	this.lon = lon || 0;
	this.ele = ele || 0;
	this.time;

	this.toString = function() {
		return "Point: lat=" + this.lat + ", lon=" + this.lon + ", ele=" + this.ele;
	};
}




function TrackSegment(name) {

	var log = log4javascript.getLogger('gpxViewer.models.TrackSegment');
	log.debug('TrackSegment created');

	this.name = name;
	this.points = new Array();

	this.calcStats = function() {
		log.debug('TrackSegment: calcStats()');
		var statsResult = {distance: 0, eleRise: 0};	// Initialise distance as number!
		var lastPoint;
		this.points.forEach(function(obj) {
			statsResult.eleMin = nullableMin(obj.ele, statsResult.eleMin);
			statsResult.eleMax = nullableMax(obj.ele, statsResult.eleMax);

			statsResult.latMin = nullableMin(obj.lat, statsResult.latMin);
			statsResult.latMax = nullableMax(obj.lat, statsResult.latMax);
			statsResult.lonMin = nullableMin(obj.lon, statsResult.lonMin);
			statsResult.lonMax = nullableMax(obj.lon, statsResult.lonMax);

			statsResult.timeMin = nullableMin(obj.time, statsResult.timeMin);
			statsResult.timeMax = nullableMax(obj.time, statsResult.timeMax);

			if (lastPoint) {
				statsResult.distance += calcDistance(lastPoint, obj);
				var dif = obj.ele - lastPoint.ele;
				if (dif > 0) {
					statsResult.eleRise += dif;
				}
			}
			lastPoint = obj;
		});
		return statsResult;
	};

	this.toString = function() {
		var text = "TrackSegment - Anzahl Punkte: " + this.points.length;
//		this.points.forEach(function(n) {
//			text += n.toString() + "\n";
//		});
		return text;
	};
}




function Track(name) {
	this.name = name || '';
	this.segments = new Array();

	this.calcStats = function() {
		log.debug('track: calcStats()');
		var statsResult = {};
		this.segments.forEach(function(obj) {
			statsResult = mergeStats(statsResult, obj.calcStats());
		});
		return statsResult;
	};

	this.toString = function() {
		var text = "Gpx.Track\n";
		text += "Anzahl Segmente: " + this.segments.length + "\n";
		this.segments.forEeach(function(n) {
			text += n.toString();
		});
		return text;
	};
}





function Tour(id, name) {
	this.id = id;
	this.name = name || '';
	this.path = '';
	this.tracks = new Array();
	this.stats = {};
	this.color;

	this.calcStats = function() {
		log.debug('container: calcStats()');
		var statsResult = {};
		this.tracks.forEach(function(obj) {
			statsResult = mergeStats(statsResult, obj.calcStats());
		});
		this.stats = statsResult;

		// format time
		if ( !statsResult.timeMax || !statsResult.timeMin ) {
			this.stats.duration = '';
		} else {
			var timeDiff = statsResult.timeMax - statsResult.timeMin;
			var dateDiff = new Date(timeDiff);
			var hour = dateDiff.getUTCHours();
			if (hour < 10) {
				this.stats.duration = '0' + hour;
			} else {
				this.stats.duration = hour;
			}
			var minutes = dateDiff.getUTCMinutes();
			this.stats.duration += ':';
			if (minutes < 10) {
				this.stats.duration += '0' + minutes;
			} else {
				this.stats.duration += minutes;
			}
			
			var date = new Date(statsResult.timeMin);
			this.stats.date = '';
			var day = date.getDate();
			if (day < 10) {
				this.stats.date += '0';
			}
			this.stats.date += day + '.';
			var month = date.getMonth()+1;
			if (month < 10) {
				this.stats.date += '0';
			}
			this.stats.date += month;
			
			this.stats.date += '.' + (date.getYear()+1900);
		}

//		var sdf = new SimpleDateFormat("HH:mm");
//		this.stats.duration = sdf.format(new Date());
	};

}
