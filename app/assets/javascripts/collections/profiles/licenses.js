define([
	'collections/base',
	'models/profile/license'
], function(Collection, model) {
	'use strict';

	var Licenses = Collection.extend({
		model: model
	});

	return Licenses;
});