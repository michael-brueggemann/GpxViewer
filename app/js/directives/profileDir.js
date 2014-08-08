'use strict';
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module('gpxViewer').controller('profileDirCtrl', ['$scope', 'gpxParser',
	function($scope, gpxParser) {
		var log = log4javascript.getLogger("gpxViewer.directives.profileDirCtrl");
		log.debug('creating directive controller: profileDirCtrl');

		var drawId = "profile";
		var profile = document.getElementById(drawId);


		var asyncExecTime = 10;

		var parsing = new Array();
		var layersVisible = {};
		var tours = new Array();
		var config = {
			autoScaleX: true,
			autoScaleY: true,
//			scaleX: 'auto',
//			scaleY: 'auto',
			gridStepXPixel: 200, // Pixel je Step X (soll)
			gridStepYPixel: 80, // // Pixel je Step Y (soll)
			gridColorLine: '#BBB',
			gridColorText: '#555',
			basisY: 'relativ'
		};
		var scaleSettings = {
			scaleX: null, // Meter pro Pixel
			scaleY: null, // Meter pro Pixel
			gridStepX: null, // Meter je Step X
			gridStepY: null, // Meter je Step Y
			gridStepXPixel: null, // Pixel je Step X (real/berechnet)
			gridStepYPixel: null, // Pixel je Step Y (real/berechnet)
			distanceMax: null, // maximale Entfernung aller Tracks (=max Meter die auf die X Achse passen müssen)
			eleDifMax: null			// maximale Höhe aller Tracks (=max Meter die auf die Y Achse passen müssen)
		};


		$scope.$watch('tourlist', function(newTourlist, oldTourlist) {
			log.trace('watch for tourlist triggered');
			if (Object.keys(newTourlist).length !== Object.keys(oldTourlist).length) {
				asyncExec('profileDirCtrl-tourlist', asyncExecTime, changed);
			} else {
				for (var id in newTourlist) {
					var trackId = id;
					if (newTourlist[id].selected !== oldTourlist[id].selected) {
						asyncExec('profileDirCtrl-tourlist', asyncExecTime, changed);
						return false;
					}
				}
			}
		},
				true);

		function changed() {
			log.info('changed()');
			if ($scope.tourlist) {
				tours = new Array();

				for (var id in $scope.tourlist) {
					if ($scope.tourlist[id].selected === true) {
						var tour = gpxParser.getTrack(id);
						addTour(tour);
					}
				}

				// always draw to draw an empty profile
				draw();
			}
		}


		function initialize() {
			log.debug('initialize()');

			//profile.style.clip ="rect(0px, " +profile.style.width+ ", "+profile.style.height+ ", 0px)";
			profile.style.clip = "rect(0px, auto, auto, 0px)";
			//profile.style.clip = "rect(0px, 500px, 900px, 0px)";
		}

		function addTour(tour) {
			log.debug('addTour()', tour.name);

			if (tour.tracks.length === 0) {
				log.warn("No tracks in the conrainer:", tour.name);
			}

			tours.push(tour);
		}


		function draw() {
			log.info('draw()');

			// always wait one second
			//	if (parsing.length > 0) {
			_draw();
		}


		function _draw() {
			log.info('_draw() tours:', tours.length);
			log.time('_draw');

			var scaleChanged = autoScale();
			log.debug('scaleChanged:', scaleChanged);

			if (scaleChanged === true) {
				log.info('scale chqanged => redraw all profiles! (' + tours.length + ')');
				
				// delete the current profile
				profile.innerHTML = '';
				createGrid();

				// create for each container a profile
				for (var i = 0; i < tours.length; i++) {
					createProfile(tours[i]);
				}
			}

			// only add / remove missing profiles
			else {
				for (var id in layersVisible) {
					layersVisible[id].visible = false;
				}
				
				for (var i = 0; i < tours.length; i++) {
					var tour = tours[i];

					if (layersVisible[tour.id]) {
						layersVisible[tour.id].visible = true;
					} else {
//						var tour = gpxParser.getTrack(id);
						createProfile(tour);
					}
				}

				for (var id in layersVisible) {
					var entry = layersVisible[id];
					if (entry.visible !== true) {
						profile.removeChild(entry.layer);
						delete entry.layer;
					}
				}

			}


//			for (var id in $scope.tourlist) {
//				if ($scope.tourlist[id].selected === true) {
//					if (layersVisible[id]) {
//						layersVisible[id].visible = true;
//					} else {
//						var tour = gpxParser.getTrack(id);
//						addTour(tour);
//					}
//				} else {
//					if (layersVisible[id]) {
//						map.removeLayer(layersVisible[id].layer);
//						delete layersVisible[id];
//					}
//				}
//			}


			log.timeEnd('_draw');
		}

		function autoScale() {
			log.debug("autoScale()");
			log.time('autoScale', log4javascript.Level.DEBUG);

			var scaleChanged = false;

			var profileDisplayWidth = profile.offsetWidth - 2; // border
			var profileDisplayHeight = profile.offsetHeight - 2; // border

			log.debug("profileDisplayWidth", profileDisplayWidth);
			log.debug("profileDisplayHeight", profileDisplayHeight);

			var eleDifMax = 0;
			var distanceMax = 0;

			tours.forEach(function(c) {
				eleDifMax = nullableMax(eleDifMax, c.stats.eleMax - c.stats.eleMin);
				distanceMax = nullableMax(distanceMax, c.stats.distance);
			});
			if (scaleSettings.distanceMax !== distanceMax) {
				scaleChanged = true;
				scaleSettings.distanceMax = distanceMax;
			}
			if (scaleSettings.eleDifMax !== eleDifMax) {
				scaleChanged = true;
				scaleSettings.eleDifMax = eleDifMax;
			}

			// scaleX: Meter pro Pixel auf der Achse
			if (config.autoScaleX === true) {
				var scaleXNew = Math.ceil(distanceMax / profileDisplayWidth);
				if (scaleSettings.scaleX !== scaleXNew) {
					scaleChanged = true;
					scaleSettings.scaleX = scaleXNew;
				}
				log.debug("auto scaleX:", scaleSettings.scaleX);
			}

			if (config.autoScaleY === true) {
				var scaleYNew = Math.ceil(eleDifMax / profileDisplayHeight * 100) / 100;
				if (scaleSettings.scaleY !== scaleYNew) {
					scaleChanged = true;
					scaleSettings.scaleY = scaleYNew;
					log.debug("auto scaleY:", scaleSettings.scaleY);
				}
			}
			log.timeEnd('autoScale');

			return scaleChanged;
		}


		function createGrid() {
			log.debug("_createGrid()");
			log.time('createGrid', log4javascript.Level.DEBUG);

			var jg = new jsGraphics(profile);

			var profileDisplayWidth = profile.offsetWidth - 2; // border
			var profileDisplayHeight = profile.offsetHeight - 2; // border

			// grid line: distance
			log.debug("create grid line - distance");

			// scale by step-width
//			var gridStepPixel = options.gridStepX / options.scaleX;
//			var maxStepsX = Math.ceil(profileDisplayWidth / gridStepPixel);

			// scale by step-amount
			var maxStepsX = Math.ceil(profileDisplayWidth / config.gridStepXPixel);
			var stepXDistanceRare = scaleSettings.distanceMax / maxStepsX;
			var stepXDistance = 0;
			if (stepXDistanceRare < 1000) {
				stepXDistance = Math.floor(stepXDistanceRare / 50) * 50;
			} else if (stepXDistanceRare < 10000) {
				stepXDistance = Math.floor(stepXDistanceRare / 500) * 500;
			} else {
				stepXDistance = Math.floor(stepXDistanceRare / 5000) * 5000;
			}
			log.debug('stepXDistance: ' + stepXDistance);

			var stepXPixel = stepXDistance / scaleSettings.scaleX;
			scaleSettings.gridStepXPixel = stepXPixel;
			log.debug('stepXPixel: ' + stepXPixel);

			// grid line: width
			for (var i = 1; i <= maxStepsX+1; i += 1) {
				jg.setColor(config.gridColorLine);
				jg.drawLine(i * stepXPixel, 0, i * stepXPixel, profileDisplayHeight);
				jg.setColor(config.gridColorText);
				jg.drawString(i * stepXDistance, i * stepXPixel, profileDisplayHeight - 20);
			}

			// grid line: height
			var maxStepsY = Math.round(profileDisplayHeight / config.gridStepYPixel);
			var stepYDistanceRare = scaleSettings.eleDifMax / maxStepsY;
			var stepYDistance = 0;
			if (stepYDistanceRare < 1000) {
				stepYDistance = Math.floor(stepYDistanceRare / 10) * 10;
			} else {
				stepYDistance = Math.floor(stepYDistanceRare / 250) * 250;
			}
			log.debug('stepYDistance: ' + stepYDistance);

			var stepYPixel = stepYDistance / scaleSettings.scaleY;
			scaleSettings.gridStepYPixel = stepYPixel;
			log.debug('stepYPixel: ' + stepYPixel);

			for (var i = 1; i <= maxStepsY; i += 1) {
				jg.setColor(config.gridColorLine);
				jg.drawLine(0, profileDisplayHeight - i * stepYPixel, profileDisplayWidth, profileDisplayHeight - i * stepYPixel);
				jg.setColor(config.gridColorText);
				jg.drawString(i * stepYDistance, 0, profileDisplayHeight - i * stepYPixel);
			}

			log.timeEnd('createGrid');

			log.time('createGrid-paint', log4javascript.Level.DEBUG);
			jg.paint();
			log.timeEnd('createGrid-paint');
		}


		function createProfile(tour) {
			log.debug('_createProfile()');
			log.time('createProfile', log4javascript.Level.DEBUG);

			//log.info("Breite/Höhe: " +profile.style.width+ "/" +profile.style.height);
			var profileDisplayWidth = profile.offsetWidth - 2; // border
			var profileDisplayHeight = profile.offsetHeight - 2; // border
			log.debug("profileDisplayHeight: " + profileDisplayHeight);

			var div = document.createElement('div');
			div.style.width = '10px';
			div.style.height = '10px';
			//div.style.border = '1px solid #FF0000';
			div.setAttribute('id', drawId + 'Layer' + tour.name);
			profile.appendChild(div);

			layersVisible[tour.id] = {
				visible: true,
				layer: div
			};

			var jg = new jsGraphics(div);
			//var jg = new jsGraphics('profile2');

			var xA = [];
			var yA = [];

			var points = new Array();
			tour.tracks.forEach(function(track) {
				track.segments.forEach(function(segment) {
					points = points.concat(segment.points);
				});
			});
			log.debug("Points (merged)", points.length);

			var trackDistance = 0;
			var heightStart = Math.round(tour.stats.eleMin);

			for (i = 0; i < points.length - 1; i++) {

				// Strecke zum nächsten Punkt berechnen
				var distance = calcDistance(points[i], points[i + 1]);
				//distance = Math.round(distance / options.scaleX);
				distance = distance / scaleSettings.scaleX;

				// Höhe ist Point Höhe
				var height;
				if (config.basisY === 'relativ') {
					height = Math.round((points[i].ele - heightStart) / scaleSettings.scaleY);
				} else {
					height = Math.round(points[i].ele / scaleSettings.scaleY);
				}

				// diff zum nächsten Punkt
				var heightDiff = Math.round((points[i + 1].ele - points[i].ele) / scaleSettings.scaleY);

				var x = Math.round(trackDistance);
				var y = profileDisplayHeight - height;

				xA.push(x);
				yA.push(y);

				trackDistance += distance;
			}

			// Polygone erstellen
			var xxA = [];
			var yyA = [];
			xxA.push(0);
			yyA.push(profileDisplayHeight);
			xxA = xxA.concat(xA);
			yyA = yyA.concat(yA);
			xxA.push(xA[xA.length - 1]);
			yyA.push(profileDisplayHeight);

			// Zeichne Topo Linie
			jg.setColor("#000000");
			//jg.setColor("green");
			for (var i = 0; i < xA.length - 1; i++) {
				jg.drawLine(xA[i], yA[i], xA[i + 1], yA[i + 1]);
			}

			// Zeichne Topo Fläche
			jg.setColor(tour.color);
			jg.setCss('myProfile');
			jg.fillPolygon(xxA, yyA);

			log.timeEnd('createProfile');

			log.time('createProfile-paint', log4javascript.Level.DEBUG);
			jg.paint();
			log.timeEnd('createProfile-paint');
		}

		initialize();
	}
]);


angular.module('gpxViewer').directive('profile', [
	function() {
		var log = log4javascript.getLogger("gpxViewer.directives.profile");
		log.debug('creating directive: profile');

		return {
			restrict: 'E',
			replace: true,
			controller: 'profileDirCtrl',
			scope: {
				tourlist: '='
			},
			templateUrl: 'js/directives/profileDir.html'};
	}
]);


log4javascript.getRootLogger().trace('file: profileDir loaded');
