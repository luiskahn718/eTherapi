define([
	'hbs!templates/therapist/search/empty-view'
], function(
	EmptyTpl
) {
	'use strict';

	var SearchTherapistEmpty = Backbone.Marionette.ItemView.extend({
		tagName: 'li',
		template: EmptyTpl
	});

	return SearchTherapistEmpty;
});