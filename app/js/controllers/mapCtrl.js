/**
 * 
 * @param {type} $scope
 * @param {type} $routeParams
 * @param {gpxParser} gpxParser
 */
function mapCtrl($scope, $routeParams, gpxParser) {

	var logger = log4javascript.getLogger('gpxViewer.controllers.mapCtrl');
	logger.info('mapCtrl created');

	$scope.tourlist = {};

	var filter = $routeParams.filter;
	logger.info('Filter:', filter);

	// use default (development) filter
	if (!filter) {
		logger.info('no filter defined => use deveolpment filter');
		filter = 'development';
	}

	// bestimmen der anzuzeigenden Tracks
	var tracksToAdd;

	if (filter === 'all') {
		tracksToAdd = new Array();
		for (var key in window.gpxFiles) {
			var list = window.gpxFiles[key];
			list.forEach(function(track) {
				tracksToAdd.push(track);
			});
		}
	} else {
		tracksToAdd = window.gpxFiles[filter];
	}

	if (!tracksToAdd) {
		tracksToAdd = window.gpxFiles.development;
	}

	var tracksToShow = new Array();
	if (tracksToAdd) {
		tracksToAdd.forEach(function(track) {
			tracksToShow.push(track);
		});
	} else {
		logger.warn('no tracks to show');
	}


	//	var colorList = randomColor({luminosity: 'light',count: 20});
	// var colorList = randomColor({luminosity: 'dark', count: tracksToShow.length});
	var colorList = ['1c16b0', 'ff0000', '00cc00', 'b30000', '80e8ff', 'ff8080', 'ff8000', '80ff80', '80c9ff', 'b37f00', 'aeb300', 'ffda80', '008f00', 'ffbfbf', '819eff', '1feb00', 'ffdfbf', 'f8ff00', 'bfe4ff', '0085a3', 'ffe700', '4c006b', 'c9c7ff', 'b780ff', 'ffc080', 'b36d00'];



	// add files to the parser
	log.info('Tracks to show: ' + tracksToShow.length);
	for (var i = 0; i < tracksToShow.length; i++) {
		gpxParser.loadFile(tracksToShow[i], addTour);
	}

	function addTour(tour) {
		if (Object.keys($scope.tourlist).length < colorList.length) {
			tour.color = '#' + colorList[Object.keys($scope.tourlist).length];
		} else {
			log.debug('not enough colors. Create random color.');
			tour.color = randomColor({luminosity: 'dark'});
		}

		var selected = false;

		// optinal: preselect the first 5 entries (set selected = true)
		if (Object.keys($scope.tourlist).length < 5) {
			selected = false;
		}

		$scope.tourlist[tour.id] = {
			selected: selected
		};
	}
}


angular
		.module('gpxViewer.controllers', [])
		.controller('mapCtrl', ['$scope', '$routeParams', 'gpxParser', mapCtrl]);


