define([
	'collections/patient/billing/cards',
	'views/patient/billing/card-item',
	'views/patient/billing/empty-view',
	'backbone-eventbroker',
], function (
	Cards,
	CardItem,
	emptyView,
	EventBroker
) {
	'use strict';

	var CardItem = Backbone.Marionette.CollectionView.extend({
		el: '#list-card-wrapper',
		itemView: CardItem,
		emptyView: emptyView,

		initialize: function(opts) {
			this.collection = new Cards(opts);
			this.render();

			// backbone events broker
			EventBroker.register({
				'card:remove': 'removeCard'
			},this);
		},

		removeCard: function(model) {
			this.collection.remove(model);
		}

	});

	return CardItem;
});