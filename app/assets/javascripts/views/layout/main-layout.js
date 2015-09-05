define([
	// 'hbs!templates/layout/therapist',
	'views/register/login-view-modal',
	'views/register/sign-up-view-modal',
	'views/register/forgot-password-view-modal',
	'views/register/signup-success-view-modal',
	'views/layout/sidebar',
	'purl',
	'conf'
], function(
	// therapistLayoutTpl,
	LoginModalView,
	SignUpModalView,
	ForgotPassWordModalView,
	SignUpSuccessModelView,
	SidebarView,
	purl,
	conf
) {
	'use strict';

	var TherapistLayout = Backbone.Marionette.Layout.extend({
		el: '#main-layout-wrapper',
		template: '#main-layout-wrapper',

		ui: {
			container: '.content-container',
			userMenu: '.user-menu',
			cancelUpcoming: '.cancel-confirm-btn',
			cancelPending: '.cancel-pending-btn',
			declineRequest: '.decline-request-btn',
			sideBar: '.main-sidebar-user',
			appointmentNav: '#nav-appointment',
			banner: '#sub-header-notification'
		},

		events: {
			'click .user-menu': 'toggleSidebar',
			'click .cancel-confirm-btn': 'cancelAppointment',
			'click .decline-request-btn': 'declineAppointment',
			'click .cancel-pending-btn': 'cancelPendingAppointment',
			'click #login': 'onShowLoginModal',
			'click #signUp': 'onShowSignUpModal',
			'click .close': 'closeBanner'
		},

		regions: {
			header: '#main-header',
			sidebar: '#main-sidebar'
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

			this.isPublicPage = options.isPublicPage;

			if (options.isPublicPage) {
				this.$el = $('.public-layout');
				this.template = $('.public-layout')
			} else {
				this.$el = $('#main-layout-wrapper');
				this.template = $('#main-layout-wrapper');
			}
		},

		serializeData: function(){
			return gon.user;
		},

		toggleSidebar: function() {
			// toggle show/hide sidebar
			if (this.ui.container.hasClass('full-width')) {
				this.ui.container.removeClass('full-width');
				this.ui.sideBar.show();
			} else {
				this.ui.container.addClass('full-width');
				this.ui.sideBar.hide();
			}
		},

		closeBanner: function() {
			console.log('closeBanner');
			this.ui.banner.hide();
		},

		onShowLoginModal: function() {
			console.log('onShowLoginModal');
		},

		onShowSignUpModal:function() {
			console.log('onShowSignUpModal');
		},

		cancelAppointment: function() {
			// call cancel appointment event
			// when confirmed YES
			var id = this.ui.cancelUpcoming.attr('model-id');
			Backbone.EventBroker.trigger('upcomingList:cancel', Number(id));
		},

		cancelPendingAppointment: function() {
			var id = this.ui.cancelPending.attr('model-id');
			Backbone.EventBroker.trigger('appointmentRequest:cancel', Number(id));
		},

		declineAppointment: function() {
			// call decline appointment event
			// when confirmed YES
			var id = this.ui.declineRequest.attr('model-id');
			Backbone.EventBroker.trigger('appointmentRequest:decline', Number(id));
		},

		onRender: function() {
			console.log('App.Render.Layout');
			var $nameUser = $('#header-username'),
				$publicLayout = $('.public-layout');
				
			if(this.isPublicPage) {
			
				var name = $nameUser.text();
				if(name) {
					this.ui.container.addClass('full-width');
					//this.ui.container.addClass('has-sidebar');
				}

				$publicLayout.append(this.loginModalView.render().$el);
				$publicLayout.append(this.signUpModelView.render().$el);
				$publicLayout.append(this.forgotPasswordModalView.render().$el);
				$publicLayout.append(this.signUpSuccessModelView.render().$el);
			}

		}
	});

	return TherapistLayout;
});