module.exports = function(config){
    config.set({

		basePath : '../',

		files : [
		  // 3rd party code
		  'app/lib/angular/angular.js',
		  'app/lib/angular/angular-*.js',
		  'app/lib/log4javascript/log4javascript_impl.js',
		  'app/lib/x2js/xml2json.min.js',
		  
		  // app specific code
		  'app/js/**/*.js',
		  
		  // test specific code
		  'test/lib/angular/angular-mocks.js',
		  
		  // unit tests
		  'test/unit/**/*.js'
		],

		exclude : [
		  'app/lib/angular/angular-loader.js',
		  'app/lib/angular/*.min.js',
		  'app/lib/angular/angular-scenario.js',
		],

		autoWatch : true,

		frameworks: ['jasmine'],
		
//		browsers : ['Chrome', 'Firefox', 'IE'],
		browsers : ['Chrome'],

		plugins : [
//				'karma-junit-reporter',
				'karma-chrome-launcher',
//	            'karma-firefox-launcher',
//				'karma-ie-launcher',
				'karma-jasmine'
				]
//				,

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
//		reporters: ['progress']
//		,
	
//	    junitReporter : {
//	      outputFile: 'test_out/unit.xml',
//	      suite: 'unit'
//	    }

	});
};
