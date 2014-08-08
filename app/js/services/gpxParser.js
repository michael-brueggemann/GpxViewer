/**
 * 
 * @returns {undefined}
 */
function gpxParser($http) {

	var log = log4javascript.getLogger('gpxViewer.services.gpxParser');
	log.info('gpxParser created');

	var extractTracks = true;
	
	var tracks = {};
	
	this.getTrack = function(id) {
		log.debug("getTrack(), ", id);
		return tracks[id];
	};

	this.loadFile = function(path, callback) {
		log.debug("parseFile(), ", path);
		log.trace("Create Ajax.Request. Path=", path);

		log.time(path);
		$http.get(path,
				{transformResponse: function(data) {
						// convert the data to JSON and provide
						// it to the success function below
						var x2js = new X2JS();
						var json = x2js.xml_str2json(data);
						return json;
					}
				}
		).success(function(data) {
			var tour = new Tour(path);
			parse(tour, data);
			tour.path = path;

			log.info('GPX file loaded: ' + path);
			log.timeEnd(path);

			tracks[tour.id] = tour;
			callback(tour);
		}).error(function(data) {
			log.error('error occured. Path: ' + path + ' - data: ' + JSON.stringify(data));
		});

		log.trace('Ajax Request created');
	};

	/**
	 * 
	 * @param {Tour} tour
	 * @param {JSON} data
	 */
	function parse(tour, data) {
		log.debug("parse()");
		log.time('GPX-Parser ' + tour.name, log4javascript.Level.DEBUG);

		if (extractTracks) {
			log.debug("extract tracks");
			var tracks = data.gpx.trk;
			//log.debug("Track Anzahl: " +docTracks.length);

			if (Array.isArray(tracks)) {
				tracks.forEach(function(track) {
					var myTrack = parseTrack(track);
					tour.tracks.push(myTrack);
				});
			} else {
				var myTrack = parseTrack(tracks);
				tour.tracks.push(myTrack);
			}
			log.debug("Alle Tracks fertig");
		}

		tour.name = tour.tracks[0].name;
		tour.cmt = tour.tracks[0].cmt;
		tour.type = tour.tracks[0].type;
		tour.desc = tour.tracks[0].desc;

		log.debug("calculate statistics");
		tour.calcStats();
		log.trace("eleMin:", tour.stats.eleMin);
		log.trace("eleMax:", tour.stats.eleMax);
		log.trace("distance:", tour.stats.distance);

		log.debug(tour.name + ", Tracks:" + tour.tracks.length);
		log.timeEnd('GPX-Parser ' + tour.name, log4javascript.Level.DEBUG);
	}

	function parseTrack(trackData) {
		log.debug("parseTrack()");
		var track = new Track();

		// get Track name (TODO optional)
		var name = trackData.name.toString();
		log.debug("Track name: " + name);
		track.name = name;

		track.cmt = (trackData.cmt || '').toString();
		track.type = (trackData.type || '').toString();
		track.desc = (trackData.desc || '').toString();

		var segments = trackData.trkseg;
		if (Array.isArray(segments)) {
			segments.forEach(function(segment) {
				track.segments.push(parseSegment(segment));
			});
		} else {
			track.segments.push(parseSegment(segments));
		}

		return track;
	}

	function parseSegment(segmentData) {
		log.debug("parseSegment()");
		var segment = new TrackSegment();

		var docPoints = segmentData.trkpt;
		log.debug("Anzahl Punkte: " + docPoints.length);
		if (docPoints.length >= 500) {
			log.warn('A lot of points. Can slow down the application! Points: ', docPoints.length);
		}
		docPoints.forEach(function(point) {
			segment.points.push(parsePoint(point));
		});

		return segment;
	}

	function parsePoint(pointData) {
		log.trace("parsePoint()");

		var lat = pointData._lat;
		var lon = pointData._lon;
		var ele = Math.round(pointData.ele);

		var point = new Point(lat, lon, ele);

		var utcDateString = pointData.time;
		if (utcDateString) {
			point.time = utcToTime(utcDateString);
		}

		log.trace(point.toString());
		return point;
	}

}


angular.module('gpxViewer.services', [])
		.service('gpxParser', ['$http', gpxParser]);
