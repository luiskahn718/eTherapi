define([
	'hbs!templates/profile/school-degree'
], function (schoolDegreeTpl) {
	'use strict';

	var SchoolDegreeView = Backbone.Marionette.ItemView.extend({
		template: schoolDegreeTpl,
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

	return SchoolDegreeView;
});