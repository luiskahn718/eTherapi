define([
	'dom-ready',
	'underscore',
	'jquery',
	'bootstrap',
	'backbone',
	'marionette'
], function(domReady, _) {
	'use strict';

	function runApp() {
		require(['routes/routers'], function(app) {
			app.run();
		});
	}

	domReady(function() {
		runApp();
	});
});
