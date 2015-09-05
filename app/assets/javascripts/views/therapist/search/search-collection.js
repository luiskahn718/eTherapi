define([
	'views/therapist/search/search-item-view',
	'collections/therapist/search/therapist',
	'views/therapist/search/search-empty-view'
], function (
	SearchItem,
	therapists,
	emptyView
) {
	'use strict';

	var SearchTherapist = Backbone.Marionette.CollectionView.extend({
		el: '#search-therapist-list',

		itemView: SearchItem,

		emptyView: emptyView,

		initialize: function() {
			this.collection = new therapists();
		}
	});

	return SearchTherapist;
});