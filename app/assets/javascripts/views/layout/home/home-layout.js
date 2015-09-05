define([
	// 'hbs!templates/layout/therapist',
	'views/register/login-view-modal',
	'views/register/sign-up-view-modal',
	'views/register/forgot-password-view-modal',
	'views/register/signup-success-view-modal',
	'purl',
	'conf',
	'api',
	'aniHeader',
	'parallax',
	'localscroll',
	'scrollTo'
], function(
	// therapistLayoutTpl,
	LoginModalView,
	SignUpModalView,
	ForgotPassWordModalView,
	SignUpSuccessModelView,
	purl,
	conf,
	api
) {
	'use strict';

	var HomepageLayout = Backbone.Marionette.Layout.extend({
		el: '#main-homepage',
		template: '#main-homepage',

		ui: {
			resetPw: '#reset-password-modal',
			signupConfirm: '#sign-up-confirmation-modal',
			nav: '#nav',
			banner: '#banner',
			testimonial: '.testimonial-wrapper',
			shot: '.shot-wrapper',
			specialty: '#speciality-txt',
			provider: '#provider-txt',
			payment: '#payment-txt',
			state: '#state-txt',
			name: '#name-txt'
		},

		events: {
			'click .login-btn': 'onShowLoginModal',
			'click .sign-up-btn': 'onShowSignUpModal',
			'click #logout-btn': 'onLogout',
			'click #contact-us-btn': 'scrollToContactUs'
		},

		regions: {
		},

		initialize: function(options) {
			//login modal view
			this.loginModalView = new LoginModalView();

			//sign up model view
			this.signUpModelView = new SignUpModalView();

			// forgot password modal
			this.forgotPasswordModalView = new ForgotPassWordModalView();

			//sign up success
			this.signUpSuccessModelView = new SignUpSuccessModelView();
			this.currentQuery = purl(window.href).attr('query').substring(7);
			console.log('this.currentQuery', this.currentQuery);
		},

		serializeData: function(){
			return gon.user;
		},

		scrollToContactUs: function() {
			var top = $('#contact-us-session').offset().top - 60;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		onShowLoginModal: function() {
			console.log('onShowLoginModal');
			$('#login-modal').modal('show');
		},

		onShowSignUpModal:function() {
			console.log('onShowSignUpModal');
			$('#signup-modal').modal('show');
		},

		onLogout: function() {
			var data = {
				authenticy_token : conf.token
			};
			
			// logout when click logout on menu sidebar
			api.del('/users/sign_out', data, function(err, res) {
				console.log('Logout response: ', err, res);
				if (res && res.success) {
					// redirect to main home page when logout success
					window.location = '/';
				} else {
					console.log('Logout error');
				}
			});
		},

		onRender: function() {
			console.log('App.Render.Layout');

      var body = $('body');

			body.append(this.loginModalView.render().$el);
			body.append(this.signUpModelView.render().$el);
			body.append(this.forgotPasswordModalView.render().$el);
			body.append(this.signUpSuccessModelView.render().$el);
			if (gon.user && gon.user.user_id)
        $('.sign-up-btn').css('visibility', 'hidden');

      if(this.currentQuery === conf.token) {
      	$('#login-modal').modal('show');
      }
		}
	});

	return HomepageLayout;
});