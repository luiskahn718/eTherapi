define([
	'hbs!templates/therapist/upcoming-appointment-empty'
], function(
	emptyTpl
) {
	'use strict';

	var UpcomingAppointmentEmpty = Backbone.Marionette.ItemView.extend({
		template: emptyTpl
	});

	return UpcomingAppointmentEmpty;
});