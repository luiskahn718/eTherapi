define([
	'collections/profiles/professional-and-association',
	'views/profile/professional-association',
	'models/profile/professional-association'
], function (
	ProfessionalAssociation,
	ProfessionalAssociationView,
	model
) {
	'use strict';

	var ProfessionalAssociationsView = Backbone.Marionette.CollectionView.extend({
		el: '.professional-list-data',
		itemView: ProfessionalAssociationView,

		initialize: function(opts) {
			var data = [];

			_.each(opts, function(val) {
				data.push({value: val});
			});
			this.collection = new ProfessionalAssociation(data);
			this.render();
		},

		addNew: function() {
			var lastModel = this.collection.last();
			if (!lastModel || (lastModel && lastModel.get('value'))) {
				var proAss = new model();
				this.collection.add(proAss);
			}
		}

	});

	return ProfessionalAssociationsView;
});