define([
	'collections/profiles/licenses',
	'views/profile/license',
	'models/profile/license'
], function (
	Licences,
	LicenseView,
	model
) {
	'use strict';

	var LicensesView = Backbone.Marionette.CollectionView.extend({
		el: '.license-list-data',
		itemView: LicenseView,


		initialize: function(opts) {
			console.log(opts);
			this.collection = new Licences(opts);
			this.render();
		},

		addNew: function() {
			var lastModel = this.collection.last();
			if (!lastModel || (lastModel && lastModel.get('license_number') && lastModel.get('state') && lastModel.get('end_date') && lastModel.get('license_type') )) {
				var license = new model();
				this.collection.add(license);
				console.log(license, this.collection);
				this.$('.striped-row').last().find('.form-group').addClass('has-error');
			}
		}
	});

	return LicensesView;
});