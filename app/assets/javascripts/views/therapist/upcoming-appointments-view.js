define([
	'collections/therapist/upcoming-appointments',
	'views/therapist/upcoming-appointment-view',
	'views/therapist/upcoming-appointment-empty',
	'backbone-eventbroker',
	'conf'
], function(
	upcomingAppointments,
	upcomingAppointmentView,
	emptyView,
	EventBroker,
	conf
) {
	'use strict';
	var UpcomingAppointmentsView = Backbone.Marionette.CollectionView.extend({
		el: '#upcoming-list',
		itemView: upcomingAppointmentView,
		emptyView: emptyView,

		initialize: function() {
			console.log('App.Render: Upcoming Appointments list');
			this.collection = new upcomingAppointments(conf.appointments.upcomming_appointments);
			this.render();

			// backbone events broker
			EventBroker.register({
				'upcomingList:add': 'addAppointment',
				'upcomingList:cancel': 'cancelAppointment',
				'upcomingList:remove': 'removeAppointment'
			},this);
		},

		addAppointment: function(model) {
			this.collection.create(model);
		},

		cancelAppointment: function(modelId) {
			console.log('Cancel Appointment');
			var appointment = this.collection.where({id: modelId});
			var model = _.clone(appointment[0]).set('status', 'x');
			$('#up-del-' + model.get('id')).click();
			if (gon.user.account_type.toLowerCase() === 'patient') {
				Backbone.EventBroker.trigger('pastCancelList:create', model.clone());
				this.collection.remove(appointment);
			} else {
				Backbone.EventBroker.trigger('pastCancelList:add', model.clone());
			}
		},

		removeAppointment: function(model) {
			this.collection.remove(model);
		}
	});

	return UpcomingAppointmentsView;
});