define([
	'collections/base',
	'models/profile/school-degree'
], function(Collection, model) {
	'use strict';

	var SchoolAndDegree = Collection.extend({
		model: model
	});

	return SchoolAndDegree;
});