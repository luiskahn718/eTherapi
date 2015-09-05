define([
	'collections/base',
	'models/profile/professional-association'
], function(Collection, model) {
	'use strict';

	var ProfessionalAndAssociation = Collection.extend({
		model: model
	});

	return ProfessionalAndAssociation;
});