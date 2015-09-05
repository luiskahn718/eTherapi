define([
	'hbs!templates/patient/billing/card',
	'api',
	'conf',
	'backbone-eventbroker'
], function (cardTpl, api, conf, EventBroker) {
	'use strict';

	var CardItem = Backbone.Marionette.ItemView.extend({
		template: cardTpl,
		className: 'data-row',

		ui: {
			btnDelete: '.btn-delete'
		},

		events: {
			'click .close': 'showModalremoveCard',
			'click .make-default': 'makeDefaultCard'
		},

		makeDefaultCard: function() {
			// this.model.set('value', this.ui.txt.val().trim());
		},

		showModalremoveCard: function() {
			$('#confirm-del-card').modal('show');
      EventBroker.register({
        'delete:card': 'onDeleteCard'
      }, this);
		},

		onDeleteCard: function() {
			this.$('.btn-delete').hide();
			var self = this,
					data = {
						authenticity_token: conf.token,
						stripe_card_id: self.model.get('id')
					};
					
			api.put('/charges/deletecard.json', data, function(err, res) {
				if (res)
					Backbone.EventBroker.trigger('card:remove', self.model);
			});
		}

	});

	return CardItem;
});