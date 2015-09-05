define([
	'hbs!templates/therapist/appointment-request-empty'
], function(
	appointmentRequestEmptyTpl
) {
	'use strict';

	var AppointmentRequestEmpty = Backbone.Marionette.ItemView.extend({
		template: appointmentRequestEmptyTpl
	});

	return AppointmentRequestEmpty;
});