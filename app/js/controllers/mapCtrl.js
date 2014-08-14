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

	var tracksToShow = new Array();

	var tracksToAdd = window.gpxFiles[filter];
	if (!tracksToAdd) {
		tracksToAdd = window.gpxFiles.development;
	}

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
		tour.color = '#' + colorList[Object.keys($scope.tourlist).length];

		var selected = false;

		// preselect the first 5 entries
		if (Object.keys($scope.tourlist).length < 5) {
			selected = true;
		}

		$scope.tourlist[tour.id] = {
			selected: selected
		};
	}
}


angular
		.module('gpxViewer.controllers', [])
		.controller('mapCtrl', ['$scope', '$routeParams', 'gpxParser', mapCtrl]);
