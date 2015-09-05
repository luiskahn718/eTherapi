define([
	'collections/base',
	'models/therapist/search/therapist'
], function(Collection, model) {
	'use strict';

	var SearchTherapist = Collection.extend({
		model: model,
		url: '/therapist/search.json',

		parse: function(res) {
			console.log(res);
			var result = res.result;
			this.reset(result);

			return result;
		}
	});

	return SearchTherapist;
});