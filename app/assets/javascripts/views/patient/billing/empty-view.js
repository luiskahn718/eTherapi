define([
	'hbs!templates/patient/billing/empty-view'
], function(
	EmptyTpl
) {
	'use strict';

	var ListCardEmpty = Backbone.Marionette.ItemView.extend({
		template: EmptyTpl
	});

	return ListCardEmpty;
});