'use strict';

describe('Service: gpxViewer', function() {

	/** 
	 * @type GpxParser
	 */
	var service;
	var $httpBackend;

	beforeEach(module('gpxViewer.services'));

	beforeEach(inject(function($injector) {
		service = $injector.get('gpxViewer');
//		$httpBackend = $injector.get('$httpBackend');
	}));

	it('should exist', inject(function() {
		expect(service).toBeDefined();
	}));

});


