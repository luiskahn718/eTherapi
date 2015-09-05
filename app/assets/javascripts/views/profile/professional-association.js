define([
	'hbs!templates/profile/professional-association'
], function (professionalAssociationTpl) {
	'use strict';

	var ProfessionalAssociationView = Backbone.Marionette.ItemView.extend({
		template: professionalAssociationTpl,
		className: 'striped-row',

		ui: {
			txt: '.form-control'
		},

		events: {
			'keyup .form-control': 'updateVal',
			'click .del-btn': 'removeRow'
		},

		updateVal: function() {
			this.model.set('value', this.ui.txt.val().trim());
		},

		removeRow: function() {
			this.model.destroy();
		}

	});

	return ProfessionalAssociationView;
});