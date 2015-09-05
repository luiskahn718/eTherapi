define([
	'hbs!templates/layout/home/therapist',
	'aniHeader',
	'parallax',
	'localscroll',
	'scrollTo'
], function (
	therapistTpl
) {
	'use strict';

	var TherapistHomepage = Backbone.Marionette.ItemView.extend({
		template: therapistTpl,

		el: '#main-therapist-wrapper',

		ui: {
		},

		events: {
			'click .sign-up-btn': 'showSignUpModal'
		},

		initialize: function() {
			var self = this;
			this.render();
		},

		serializeData: function() {
		},

		onRender: function() {
			console.log('App.Render: Therapist Homepage View');
      
      $('#nav').localScroll(600);
      $('#banner').parallax("50%", .5);
      $('.testimonial-wrapper').parallax("50%", .2);
      $('.shot-wrapper').parallax("50%", .3);
			if (gon.user && gon.user.user_id)
        $('.sign-up-btn').css('visibility', 'hidden');
      // this.ui.state.chosen({width: "100%"});
		},

		showSignUpModal: function() {
			console.log('showSignUpModal');
			$('#signup-modal').modal('show');
		}
	});

	return TherapistHomepage;
});