define([
	'collections/base',
	'models/base'
], function(Collection, model) {
	'use strict';

	var Cards = Collection.extend({
		model: model
	});

	return Cards;
});