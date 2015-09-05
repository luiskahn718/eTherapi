define([
	'hbs!templates/layout/footer'
], function(
	footerTpl
) {
	'use strict';

	var FooterView = Backbone.Marionette.ItemView.extend({
		template: footerTpl,
		el: '#main-footer',

		serializeData: function(){
			return gon.user;
		}
	});

	return FooterView;
});