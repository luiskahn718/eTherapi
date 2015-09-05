define([
	'collections/therapist/past-appointments',
	'views/therapist/past-appointment-view',
	'views/therapist/past-appointment-empty',
	'backbone-eventbroker',
	'conf'
], function(
	pastAppointments,
	pastAppointmentsView,
	emptyView,
	EventBroker,
	conf
) {
	'use strict';
	var PastAppointmentsView = Backbone.Marionette.CollectionView.extend({
		el: '#past-appointment-list',
		itemView: pastAppointmentsView,
		emptyView: emptyView,

		initialize: function() {
			this.collection = new pastAppointments(conf.appointments.past_or_cancel_appointments);
			this.render();
			EventBroker.register({
				'pastCancelList:add': 'addAppointment',
				'pastCancelList:create': 'createAppointment'
			},this);
		},

		addAppointment: function(model) {
			this.collection.add(model);
		},

		createAppointment: function(model) {
			this.collection.create(model);
		},

		onRender: function() {
			console.log('App.Render: Past-Cancelled Appointments list');
			// implement bootstrap scrollspy
			// after past-cancel appointment list rendered
			$('body').scrollspy({ target: '.affix-menu-nav', offset: 400 });
		}
	});

	return PastAppointmentsView;
});