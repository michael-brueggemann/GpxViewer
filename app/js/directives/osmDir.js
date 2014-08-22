'use strict';
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module('gpxViewer').controller('osmDirCtrl', ['$scope', 'gpxParser',
	function($scope, gpxParser) {
		var log = log4javascript.getLogger("gpxViewer.directives.osmDirCtrl");
		log.debug('creating directive controller: osmDirCtrl');

		// default map position (Grossarl)
		var defaultLat = 47.2391;
		var defaultLon = 13.1967;
		var defaultZoom = 12;

		// time for scope change
		var asyncExecTimeChanged = 50;

		// time for osm to focus map (gpx files must be loaded)
		var asyncExecTimeFocus = 250;

		var map; //complex object of type OpenLayers.Map
		var layer;
		var layersVisible = {};
		var layersCreated = {};

		function init() {
			log.debug("init()");
			map = new OpenLayers.Map("osmMap", {
				controls: [
					new OpenLayers.Control.Navigation(),
					new OpenLayers.Control.PanZoomBar(),
					new OpenLayers.Control.LayerSwitcher(),
					new OpenLayers.Control.Attribution()],
				maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
				maxResolution: 156543.0399,
				numZoomLevels: 19,
				units: 'm',
				projection: new OpenLayers.Projection("EPSG:900913"),
				displayProjection: new OpenLayers.Projection("EPSG:4326")
			});

			// Define the map layer
			// Here we use a predefined layer that will be kept up to date with URL changes
			var layerMapnik = new OpenLayers.Layer.OSM.Mapnik("Mapnik");
			map.addLayer(layerMapnik);
			var layerCycleMap = new OpenLayers.Layer.OSM.CycleMap("CycleMap");
			map.addLayer(layerCycleMap);
			var layerMarkers = new OpenLayers.Layer.Markers("Markers");
			map.addLayer(layerMarkers);

			map.setCenter(new OpenLayers.LonLat(defaultLon, defaultLat) // Center of the map
					.transform(
							new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
							new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
							), defaultZoom // Zoom level
					);


			// Add the Layer with the GPX Track
//			var lgpx = new OpenLayers.Layer.Vector("Lakeside cycle ride", {
//				strategies: [new OpenLayers.Strategy.Fixed()],
//				protocol: new OpenLayers.Protocol.HTTP({
//					url: 'gpx/2014.06.01_Dandelberg_Alm.gpx',
//					format: new OpenLayers.Format.GPX()
//				}),
//				style: {strokeColor: "red", strokeWidth: 5, strokeOpacity: 0.5},
//				projection: new OpenLayers.Projection("EPSG:4326")
//			});
//			map.addLayer(lgpx);
//			focus(lgpx);

//			var lonLat = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
//			map.setCenter(lonLat, zoom);
//			map.zoomToExtent(lgpx.getDataExtent());

//			var size = new OpenLayers.Size(21, 25);
//			var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
//			var icon = new OpenLayers.Icon('http://www.openstreetmap.org/openlayers/img/marker.png', size, offset);
//			layerMarkers.addMarker(new OpenLayers.Marker(lonLat, icon));
		}


		function focus(pLayer) {
			log.debug("focus()");
			layer = pLayer;

			// We must wait a little bit (Openlayers error message: bounds is null)
			asyncExec('osmDirCtrl-focus', asyncExecTimeFocus, function() {
				log.debug("focus() asyncExec callback triggered");

				var maxBounds = new OpenLayers.Bounds();
				
				if (!layer) {
					for (var id in layersVisible) {
						maxBounds.extend(layersVisible[id].layer.getDataExtent());
						log.trace(maxBounds.toString());
					}
				} else {
					maxBounds = layer.getDataExtent();
				}

				if (maxBounds) {
					log.debug('max bounds:', maxBounds.toString());
					map.zoomToExtent(maxBounds, false);
				} else {
					log.debug('no max bounds available');
				}
			});
		}


		$scope.$watch('tourlist', function(newTourlist, oldTourlist) {
			log.trace('watch for tourlist triggered');
			if (Object.keys(newTourlist).length !== Object.keys(oldTourlist).length) {
				asyncExec('osmDirCtrl-tourlist', asyncExecTimeChanged, changed);
			} else {
				for (var id in newTourlist) {
					var trackId = id;
					if (newTourlist[id].selected !== oldTourlist[id].selected) {
						asyncExec('osmDirCtrl-tourlist', asyncExecTimeChanged, changed);
						return false;
					}
				}
			}
		},
				true);

		function changed() {
			log.info('changed !!!');

			if ($scope.tourlist) {
				log.time('osm map');

				// reset visible flag
				for (var id in layersVisible) {
					layersVisible[id].visible = false;
				}

				for (var id in $scope.tourlist) {
					if ($scope.tourlist[id].selected === true) {
						if (layersVisible[id]) {
							layersVisible[id].visible = true;
						} else {
							var tour = gpxParser.getTrack(id);
							addTour(tour);
						}
					} else {
						if (layersVisible[id]) {
							map.removeLayer(layersVisible[id].layer);
							delete layersVisible[id];
						}
					}
				}

//				layersVisible.forEach(function(layer) {
//					map.removeLayer(layer);
//				});
//				layersVisible = new Array();
//
//				for (var id in $scope.tourlist) {
//					if ($scope.tourlist[id].selected === true) {
//						var tour = gpxParser.getTrack(id);
//						addTour(tour);
//					}
//				}

				log.timeEnd('osm map');
			}
		}



		function addTour(tour) {
			log.debug("addTour()", tour.path);

			// Merge layer style
			var layerStyle = {strokeColor: "green", strokeWidth: 5, strokeOpacity: 0.7};
			layerStyle.strokeColor = tour.color;

			var lgpx = null;

			// reuse already created layer
//			if (layersCreated[tour.path]) {
//				lgpx = layersCreated[tour.path];
//			}

			// create new layer (=async gpx loading)
			if (!lgpx) {
				// create new layer
				lgpx = new OpenLayers.Layer.Vector(tour.name, {
					strategies: [new OpenLayers.Strategy.Fixed()],
					protocol: new OpenLayers.Protocol.HTTP({
						url: tour.path,
						format: new OpenLayers.Format.GPX()
					}),
					style: layerStyle,
					projection: new OpenLayers.Projection("EPSG:4326")
				});
				layersCreated[tour.path] = lgpx;
			}

			map.addLayer(lgpx);
			layersVisible[tour.id] = {
				visible: true,
				layer: lgpx
			}

			// focus
			focus();
		}


		init();
	}
]);


angular.module('gpxViewer').directive('osm', [
	function() {
		var log = log4javascript.getLogger("gpxViewer.directives.osm");
		log.debug('creating directive: osm');

		return {
			restrict: 'E',
			replace: true,
			controller: 'osmDirCtrl',
			scope: {
				tourlist: '='
			},
			templateUrl: 'js/directives/osmDir.html'};
	}
]);


log4javascript.getRootLogger().trace('file: osmDir loaded');