define([
	'collections/therapist/appointments-request',
	'views/therapist/appointment-request-view',
	'views/therapist/appointment-request-empty',
	'backbone-eventbroker',
	'conf'
], function(
	appointmentRequest,
	appointmentRequestView,
	emptyView,
	EventBroker,
	conf
) {
	'use strict';
	var AppointmentsRequestView = Backbone.Marionette.CollectionView.extend({
		el: '#appointment-request-list',
		itemView: appointmentRequestView,
		emptyView: emptyView,

		initialize: function() {
			console.log('App.Render: Appointment Request list');
			this.collection = new appointmentRequest(conf.appointments.request_appointments);
			this.render();

			// backbone events broker
			EventBroker.register({
				'appointmentRequest:remove': 'removeAppointment',
				'appointmentRequest:cancel': 'cancelPatientAppointment',
				'appointmentRequest:decline': 'declineAppointment'
			},this);
		},

		removeAppointment: function(model) {
			this.collection.remove(model);
		},

		declineAppointment: function(modelId) {
			console.log('Decline Appointment');
			Backbone.EventBroker.trigger('request:scroll');
			// remove decline appointment in appointment collection
			$('#request-del-' + modelId).click();
			var appointment = this.collection.where({id: modelId});
			this.collection.remove(appointment);
		},

		cancelPatientAppointment: function(modelId) {
			console.log('Cancel Pending-Request Appointment', modelId);
			var appointment = this.collection.where({id: modelId});
			var model = _.clone(appointment[0]).set('status', 'x');
			if (gon.user.account_type.toLowerCase() === 'therapist')
				$('#request-del-' + model.get('id')).click();
			else
				$('#request-cancel-' + model.get('id')).click();
			Backbone.EventBroker.trigger('pastCancelList:create', model.clone());
			if (gon.user.account_type.toLowerCase() === 'patient') {
				this.collection.remove(appointment);
			}
		}
	});

	return AppointmentsRequestView;
});