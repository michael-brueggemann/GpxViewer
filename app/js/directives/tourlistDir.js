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

		$scope.filter = {};
		$scope.filter.name = '';

		$scope.tourlistMetaData = new Array();

		$scope.selectionChangedForAll = function(event) {
			log.debug('selectionChangedForAll');

			var checkbox = event.target;

			for (var id in $scope.tourlistMetaData) {
				var tourMetaData = $scope.tourlistMetaData[id];
				// only change selected state for entries not filtered out
				if (tourMetaData.isFilterVisible === true) {
//					$scope.tourlist[tourMetaData.id].selected = checkbox.checked;
					tourMetaData.selected = checkbox.checked;
				}
			}
		};

		$scope.myFilter = function(criteria) {
			log.debug('myFilter()');

			return function(tour) {
				log.debug('check filter for id=', tour.id);
				var result = true;

				var filterName = $scope.filter.name || '';
				var filterDuration = $scope.filter.duration || '';
				var filterDistance = $scope.filter.distance || '';
				var filterEleRise = $scope.filter.eleRise || '';

				// don't filter if filter string is empty
				// ok when name matches
				log.trace('filter: name');
				if (filterName.length === 0
						|| tour.name.toLowerCase().indexOf(filterName.toLowerCase()) > -1) {
					log.trace('  filter: "empty" => visible=true');
					result = result && true;
				}
				// not in result => set selected to false
				else {
					log.trace('  visible=false');
					tour.selected = false;
					result = result && false;
				}

				log.trace('filter: duration');
				if (tour.stats.duration instanceof Date) {
					result = result && filterByNumberString(filterDuration, tour.stats.duration.getTime() / (60*1000), tour);
				}

				log.trace('filter: distance');
				result = result && filterByNumberString(filterDistance, tour.stats.distance, tour);

				log.trace('filter: eleRise');
				result = result && filterByNumberString(filterEleRise, tour.stats.eleRise, tour);

				tour.isFilterVisible = result;

				log.debug('isVisible:', tour.isFilterVisible);
				return result;
			};
		};

		/**
		 * 
		 * @param {String} filterString e.g. "<500"
		 * @param {Number} tourValue e.g. 465
		 * @param {Tour} tour
		 * @returns {Boolean}
		 */
		function filterByNumberString(filterString, tourValue, tour) {

			// don't filter if filter string is empty
			if (filterString.length <= 1) {
				log.trace('  filter: "empty" => visible=true');
				return true;
			} else {
				var sign = filterString.substring(0, 1);
				var value = filterString.substring(1);
				if (sign === '>') {
					log.trace('  filter: >');
					if (tourValue >= value) {
						log.trace('    visible=true');
						return true;
					} else {
						log.trace('    visible=false');
						tour.selected = false;
						return false;
					}
				} else if (sign === '<') {
					log.debug('  filter: <');
					if (tourValue <= value) {
						log.debug('    visible=true');
						return true;
					} else {
						log.debug('    visible=false');
						tour.selected = false;
						return false;
					}
				} else {
					log.info('wrong filter:', filterString);
					return true;
				}
			}

			// default: no filter
			return true;
		}

		$scope.showDesc = function(desc) {
			//console.log(desc);
		};

		$scope.$watch('tourlistMetaData', function(newTourlistMetaData, oldTourlistMetaData) {
			log.trace('watch for tourlistMetaData triggered');
			if (Object.keys(newTourlistMetaData).length !== Object.keys(oldTourlistMetaData).length) {
//				changed();
			} else {
				for (var index in newTourlistMetaData) {
					if (newTourlistMetaData[index].selected !== oldTourlistMetaData[index].selected) {
						log.debug('sync selected state for id:', newTourlistMetaData[index].id);
						$scope.tourlist[newTourlistMetaData[index].id].selected = newTourlistMetaData[index].selected;
//						return false;
					}
				}
			}
		},
				true);


		$scope.$watch('tourlist', function(newTourlist, oldTourlist) {
			log.trace('watch for tourlist triggered');
			if (Object.keys(newTourlist).length !== Object.keys(oldTourlist).length) {
				initTourlistMetaData();
			}
//			else {
//				for (var id in newTourlist) {
//					if (newTourlist[id].selected !== oldTourlist[id].selected) {
//						changed();
//						return false;
//					}
//				}
//			}
		},
				true);

		function initTourlistMetaData() {
			log.info('changed !!!');

			$scope.tourlistMetaData = new Array();
			for (var id in $scope.tourlist) {
				var tour = gpxParser.getTrack(id);
				$scope.tourlistMetaData.push({
					id: tour.id,
					path: tour.path,
					selected: $scope.tourlist[id].selected,
					color: tour.color,
					desc: tour.desc,
					name: tour.name,
					type: tour.type,
					stats: {
						date: tour.stats.date,
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
