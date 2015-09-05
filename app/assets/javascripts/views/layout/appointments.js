define([
	// 'hbs!templates/layout/appointments',
	'backbone-eventbroker',
	'purl',
	'api',
	'conf',
	'views/therapist/upcoming-appointments-view',
	'views/therapist/appointments-request-view',
	'views/therapist/past-appointments-view'
], function(
	// appointmentsTpl,
	EventBroker,
	purl,
	api,
	conf,
	upcomingAppointmentsView,
	appointmentsRequestView,
	pastAppointmentsView
) {
	'use strict';

	var AppointmentsLayout = Backbone.Marionette.ItemView.extend({
		el: '#appointments-layout',
		template: '#appointments-layout',

		ui: {
			affixMenu: '.affix-menu-nav',
			upcomingSection: '#upcoming-section',
			requestSection: '#request-section',
			pastCancelSection: '#past-cancel-section'
		},

		events: {
			'click .upcoming-section': 'scrollToUpcoming',
			'click .request-section': 'scrollToRequest',
			'click .past-cancel-section': 'scrollToPastCancel'
		},

		serializeData: function() {
			return gon.user;
		},

		initialize: function() {
			var self = this;
			// get appointments list
			api.get('/appointments.json', function(err, res) {
				// console.log(err, res);
				if (res) {
					conf.appointments = res;
					self.render();
				}
			});
			this.headerHeight = 60;

			// backbone events broker
			EventBroker.register({
				'upcoming:scroll': 'scrollToUpcoming',
				'past-cancel:scroll': 'scrollToPastCancel',
				'request:scroll': 'scrollToRequest'
			},this);
		},

		scrollToUpcoming: function() {
			var top = this.ui.upcomingSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToRequest: function() {
			var top = this.ui.requestSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToPastCancel: function() {
			var top = this.ui.pastCancelSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		successRequestSetting: function() {
			// fadein success notification
			var notification = $('#sub-header-notification');
			notification.show();
			notification.addClass('themed-background-success').fadeIn('slow');
			notification.find('.content').html('Appointment Request Submitted');
			$("body, html").animate({ scrollTop: 0 }, 300);

			// fadeon success notification after 10s
			setTimeout(function() {
				notification.fadeOut('slow');
			}, 10000);
		},

		onRender: function() {
			var self = this;

			var UpcomingAppointmentsView = new upcomingAppointmentsView();
			var AppointmentsRequestView = new appointmentsRequestView();
			var PastAppointmentsView = new pastAppointmentsView();
			var changeAffixWidth = function() {
				self.ui.affixMenu.css('width', self.ui.affixMenu.width() - 1);
			};
			changeAffixWidth();
			var checkAffixWidth= _.debounce(changeAffixWidth, 200);
			$(window).resize(function() {
				self.ui.affixMenu.removeAttr('style');
				checkAffixWidth();
			});
			if (gon.user.account_type.toLowerCase() === 'patient')
				this.ui.pastCancelSection.removeClass('past-appointment');
			// show active nav on sidebar
			// change href of current view
			// to implement scrolling behavior
			var navAppointment = $('#nav-appointment');
			navAppointment.addClass('active');
			navAppointment.next().find('a').attr('href', 'javascript:void(0)');
			
			this.ui.affixMenu.affix({
		    offset: {
		      top: 150,
		      bottom: 200
		    }
		  });
		  this.ui.affixMenu.find('ul').addClass('nav');
		  var sidebar = $('#main-sidebar');

		  // implement bootstrap scrollspy
			$('body').scrollspy('refresh');
			$('body').on('activate.bs.scrollspy', function (e) {
				var sidebarActive = $(e.target).attr('target');
				sidebar.find('.scrollby-section a').removeClass('active');
				sidebar.find(sidebarActive).addClass('active');
			});
		  // scroll to section
			var fragment = purl(window.href).attr('fragment');
			if (fragment !== '')
				setTimeout(function() {
			  	self.$el.find('.'+ fragment).click();
				}, 300);

			var request = purl(window.href).param();
			console.log(request.requested);
			if (request.requested) {
				this.successRequestSetting();
				history.replaceState("object or string", "title", "/appointments");
			}
		}
	});

	return AppointmentsLayout;
});