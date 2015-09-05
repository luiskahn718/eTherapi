define([
	'hbs!templates/layout/sidebar',
	'api',
	'conf'
], function(
	sidebarTpl,
	api,
	conf
) {
	'use strict';

	var SidebarView = Backbone.Marionette.ItemView.extend({

		template: '#main-sidebar',

		ui: {
			dropdownMenu: '.sidebar-nav-menu'
		},

		events: {
			'click #nav-logout': 'logout',
			'click .sidebar-nav-menu': 'toggleSidebarDropdown',
			'click .upcoming-section': 'scrollToUpcoming',
			'click .request-section': 'scrollToRequest',
			'click .past-cancel-section': 'scrollToPastCancel',
			'click .account-info-section': 'scrollTAccountInfo',
			'click .practice-details-section': 'scrollToPracticeDetails',
			'click .intake-forms-section': 'scrollToIntakeForms',
			'click .change-password-section': 'scrollToChangePassword',
			'click .profile-pic-section': 'scrollProfilePic',
			'click .about-section': 'scrollToAbout',
			'click .finances-section': 'scrollToFinances',
			'click .specialties-section': 'scrollToSpecialties',
			'click .credentials-section': 'scrollToCredentials',
			'click .tagsinput': 'focusOnTextInput',
			'click .pt-pro-pic-section': 'scrollToProPic',
			'click .pt-contact-info-section': 'scrollToContactInfo',
			'click .pt-insurance-section': 'scrollToInsurance',
			'click .pt-mh-section': 'scrollToMH',
			'click ul > li > a': 'activeSidebar'
		},

		 initialize: function(opts) {
		 	if(opts) {
		 		if(opts.user) {
			 		this.$el = $('.main-sidebar-user');

			 		this.template = sidebarTpl;

		      if(opts.user.account_type.toLowerCase() === 'therapist') {
		        this.isTherapist = true;
		      } else {
		        this.isTherapist = false;
		      }
		      this.userProfileInfo = {
		        user: opts.user,
		        isTherapist: this.isTherapist,
		        profile: opts.profile
		      }		
		 		} 

		 	}

		 	if(!gon.user) {
		 		this.template = sidebarTpl;
		 	}

      this.render();
    },

    serializeData: function() {

      //console.log('this.userProfileInfo', this.userProfileInfo);
      return this.userProfileInfo;
    },

    activeSidebar: function(e) {
    	var $el = $(e.currentTarget),
    	naviMenu = $el.hasClass('sidebar-nav-menu'),
    	$item =  $el.closest('ul > li > a'),
    	$allSubMenu = this.$('.sidebar-nav-menu'),
    	$allLi = $allSubMenu.siblings('ul'),
    	$allaChild = $allLi.children('li').find('a').not($el);

    	if (!naviMenu) {
    		$el.addClass('active');
    		_.each($allaChild, function(a) {
    			$(a).removeClass('active');
    		});

    	}
    },

		toggleSidebarDropdown: function(e) {
			console.log('Toggle dropdown menu');
			var upspeed = 250,
					downspeed = 250,
					target = $(e.target).closest('.sidebar-nav-menu');

			// handle click to dropdown menu behavior
			if (target.parent().hasClass('active') !== true) {
				if (target.hasClass('open')) {
					target.removeClass('open').next().slideUp(upspeed);
				} else {
					target.addClass('open').next().slideDown(downspeed);
				}
			}
		},

		logout: function() {
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

		scrollToUpcoming: function() {
			Backbone.EventBroker.trigger('upcoming:scroll');
		},

		scrollToRequest: function() {
			Backbone.EventBroker.trigger('request:scroll');
		},

		scrollToPastCancel: function() {
			Backbone.EventBroker.trigger('past-cancel:scroll');
		},

		scrollTAccountInfo: function() {
			Backbone.EventBroker.trigger('account-info:scroll');
		},

		scrollToPracticeDetails: function() {
			Backbone.EventBroker.trigger('practice-details:scroll');
		},

		scrollToChangePassword: function() {
			Backbone.EventBroker.trigger('change-pass:scroll');
		},

		scrollToIntakeForms: function() {
			Backbone.EventBroker.trigger('intake-forms:scroll');
		},

		scrollProfilePic: function() {
			Backbone.EventBroker.trigger('profile-pic-form:scroll');
		},

		scrollToAbout: function() {
			Backbone.EventBroker.trigger('about-form:scroll');
		},

		scrollToFinances: function() {
			Backbone.EventBroker.trigger('finances-form:scroll');
		},

		scrollToSpecialties: function() {
			Backbone.EventBroker.trigger('specialties-form:scroll');
		},

		scrollToCredentials: function() {
			Backbone.EventBroker.trigger('credentials-form:scroll');
		},

		scrollToProPic: function() {
			Backbone.EventBroker.trigger('proPicSec:scroll');
		},

		scrollToContactInfo: function() {
			Backbone.EventBroker.trigger('infoSec:scroll');
		},

		scrollToInsurance: function() {
			Backbone.EventBroker.trigger('insuranceSec:scroll');
		},

		scrollToMH: function() {
			Backbone.EventBroker.trigger('mh:scroll');
		},

		onRender: function() {
			// bootstrap affix left appointment menu
			this.$el.affix({
		    offset: {
		      // top: 50
		    }
		  })
		}
	});

	return SidebarView;
});