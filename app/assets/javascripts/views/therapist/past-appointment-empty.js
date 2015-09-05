define([
	'hbs!templates/therapist/past-appointment-empty'
], function(
	emptyTpl
) {
	'use strict';

	var PastAppointmentEmpty = Backbone.Marionette.ItemView.extend({
		template: emptyTpl
	});

	return PastAppointmentEmpty;
});