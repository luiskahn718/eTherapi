define([
	'collections/profiles/school-and-degree',
	'views/profile/school-degree',
	'models/profile/school-degree'
], function (
	SchoolDegree,
	SchoolDegreeView,
	model
) {
	'use strict';

	var SchoolsDegree = Backbone.Marionette.CollectionView.extend({
		el: '.school-list-data',
		itemView: SchoolDegreeView,

		initialize: function(opts) {
			var data = [];

			_.each(opts, function(val) {
				data.push({value: val});
			});
			this.collection = new SchoolDegree(data);
			this.render();
		},

		addNew: function() {
			var lastModel = this.collection.last();
			if (!lastModel || (lastModel && lastModel.get('value'))) {
				var schoolDegree = new model();
				this.collection.add(schoolDegree);
			}
		}

	});

	return SchoolsDegree;
});