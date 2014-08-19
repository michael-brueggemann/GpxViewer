'use strict';


angular
		.module('gpxViewer', [
			'ngRoute',
			'ngResource',
			'gpxViewer.controllers',
			'gpxViewer.services',
			'gpxViewer.filters',
			'ui.bootstrap'
		])
		.config(['$routeProvider',
			function($routeProvider) {
				$routeProvider.when('/:filter?', {
					templateUrl: 'partials/map.html',
					controller: 'mapCtrl'
				});
				$routeProvider.otherwise({
					redirectTo: '/'
				});
			}
		]);



// define service modules
//angular.module('gpxViewer.services', ['gpxViewer.misc.services']).value('version', '0.1');
//angular.module('gpxViewer.commonservices', []);
//angular.module('gpxViewer.integrationservices', []);
//angular.module('gpxViewer.utils', []);








// Define root logger and log levels
var logRoot = log4javascript.getRootLogger();
var appender = new log4javascript.PopUpAppender();
var layout = new log4javascript.PatternLayout('%d{HH:mm:ss.sss} %-5p %-35c - %m%n');
appender.setLayout(layout);
logRoot.addAppender(appender);
logRoot.setLevel(log4javascript.Level.TRACE);
log4javascript.setEnabled(false);

if (window.location.host === 'localhost:8383') {
	log4javascript.setEnabled(true);

	log4javascript.getLogger('gpxViewer.models').setLevel(log4javascript.Level.INFO);
	log4javascript.getLogger('gpxViewer.utils.asyncExec').setLevel(log4javascript.Level.INFO);
	log4javascript.getLogger('gpxViewer.services.gpxParser').setLevel(log4javascript.Level.INFO);
	log4javascript.getLogger('gpxViewer.directives.tourlistDirCtrl').setLevel(log4javascript.Level.TRACE);
	log4javascript.getLogger('gpxViewer.directives.osmDirCtrl').setLevel(log4javascript.Level.INFO);
	log4javascript.getLogger('gpxViewer.directives.profileDirCtrl').setLevel(log4javascript.Level.INFO);

	logRoot.trace('Trace level check');
	logRoot.info('Logging loaded and configured.');
}







function nullableMin(e1, e2) {
	if (e1 && e2) {
		return Math.min(e1, e2);
	}
	else if (e1) {
		return e1;
	}
	else if (e2) {
		return e2;
	}
}

function nullableMax(e1, e2) {
	if (e1 && e2) {
		return Math.max(e1, e2);
	}
	else if (e1) {
		return e1;
	}
	else if (e2) {
		return e2;
	}
}

// return the time in milliseconds (for use in new Date(time) to get a date object with the local time zone)
function utcToTime(utcString) {
	var utcStringRegExp = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})Z$/;
	var result = utcStringRegExp.exec(utcString);

	// JavaScript Date.UTC: month is count from 0 => January is 0
	return Date.UTC(result[1], result[2] - 1, result[3], result[4], result[5], result[6]);
}



// convert degrees to radians
function toRad(num) {
	return num * Math.PI / 180;
}


Number.prototype.toRad = function() {  // convert degrees to radians
	return this * Math.PI / 180;
};


function calcDistance(p1, p2) {
	var lat1 = p1.lat;
	var lon1 = p1.lon;
	var lat2 = p2.lat;
	var lon2 = p2.lon;

	var R = 6371; // km
	var dLat = toRad((lat2 - lat1));
	var dLon = toRad((lon2 - lon1));
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;

	return Math.round(d * 1000);
}


/**
 * Formats a date in hour:min.
 * 
 * @param {Date} date the duration to format
 * @returns {String} the formatted date (e.g. 3:20)
 */
function formatDuration(date) {
	var result = '';

	if (date) {
		var hour = date.getUTCHours();
		if (hour < 10) {
			result = '0' + hour;
		} else {
			result = hour;
		}
		var minutes = date.getUTCMinutes();
		result += ':';
		if (minutes < 10) {
			result += '0' + minutes;
		} else {
			result += minutes;
		}
	}

	return result;
}


// my namespace
var mbr = {};
mbr.asyncExec = {};

function asyncExec(key, time, callback) {
	var log = log4javascript.getLogger("gpxViewer.utils.asyncExec");

	if (time === 0) {
		log.info('time is 0, execute callback. Key:', key);
		callback();
	}

	if (mbr.asyncExec[key]) {
		log.debug('asyncExec: existing found. Cancel and create a new one. Key:', key);
		window.clearTimeout(mbr.asyncExec[key]);
		mbr.asyncExec[key] = undefined;
	}

	log.debug('asyncExec: create one. Key:', key);
	mbr.asyncExec[key] = window.setTimeout(function() {
		log.debug('asyncExec: execute callback. Key:', key);
		callback();
	}, time);

}

