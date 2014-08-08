'use strict';
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module('gpxViewer').controller('tourlistDirCtrl', ['$scope', 'gpxParser',
	function($scope, gpxParser) {
		var log = log4javascript.getLogger("gpxViewer.directives.tourlistDirCtrl");
		log.debug('creating directive controller: tourlistDirCtrl');

		$scope.search = {};
		$scope.search.name = '';

		$scope.tourlistMetaData = new Array();

		$scope.selectionChanged = function(event, tour) {
			log.debug('selectionChanged', tour.name);

			var checkbox = event.target;
//			if (checkbox.checked) {
//				tour.color = colorService.getColor(tour.path);
//			} else {
//				tour.color = 'black';
//				colorService.removeColor(tour.path);
//			}
		};

		$scope.selectionChangedForAll = function(event) {
			log.debug('selectionChangedForAll');

			var checkbox = event.target;
			
			for(var id in $scope.tourlist) {
				$scope.tourlist[id].selected = checkbox.checked;
			}
		};

		$scope.myFilter = function(criteria) {
			return function(tour) {
				var result = false;
				// don't filter if filter string is empty
				if ($scope.search.name.length == 0) {
					result = true;
				}
				// ok when name matches
				else if (tour.name.indexOf($scope.search.name) > -1) {
					result = true;
//					tour.selected = true;
				}
				// not in result => set selected to false
				else {
					tour.selected = false;
				}
				return result;
			};
		};

		$scope.showDesc = function(desc) {
			//console.log(desc);
		};

		$scope.$watch('tourlistMetaData', function(newTourlistMetaData, oldTourlistMetaData) {
			log.trace('watch for tourlistMetaData triggered');
			if (Object.keys(newTourlistMetaData).length !== Object.keys(oldTourlistMetaData).length) {
				changed();
			} else {
				for (var index in newTourlistMetaData) {
					if (newTourlistMetaData[index].selected !== oldTourlistMetaData[index].selected) {
						$scope.tourlist[newTourlistMetaData[index].id].selected = newTourlistMetaData[index].selected;
						return false;
					}
				}
			}
		},
				true);


		$scope.$watch('tourlist', function(newTourlist, oldTourlist) {
			log.trace('watch for tourlist triggered');
			if (Object.keys(newTourlist).length !== Object.keys(oldTourlist).length) {
				changed();
			} else {
				for (var id in newTourlist) {
					if (newTourlist[id].selected !== oldTourlist[id].selected) {
						changed();
						return false;
					}
				}
			}
		},
				true);

		function changed() {
			log.info('changed !!!');

			$scope.tourlistMetaData = new Array();
			for (var id in $scope.tourlist) {
				var tour = gpxParser.getTrack(id);
				$scope.tourlistMetaData.push({
					id: tour.id,
					selected: $scope.tourlist[id].selected,
					color: tour.color,
					desc: tour.desc,
					name: tour.name,
					type: tour.type,
					stats: {
						duration: tour.stats.duration,
						eleMin: tour.stats.eleMin,
						eleMax: tour.stats.eleMax,
						eleRise: tour.stats.eleRise,
						distance: tour.stats.distance
					}
				});
			}
		}
	}
]);


angular.module('gpxViewer').directive('tourlist', [
	function() {
		var log = log4javascript.getLogger("gpxViewer.directives.tourlist");
		log.debug('creating directive: tourlist');

		return {
			restrict: 'E',
			replace: true,
			controller: 'tourlistDirCtrl',
			scope: {
				tourlist: '='
			},
			templateUrl: 'js/directives/tourlistDir.html'
		};
	}
]);


log4javascript.getRootLogger().trace('file: tourlistDir loaded');
