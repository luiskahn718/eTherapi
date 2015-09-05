define([
	'collections/base',
	'models/therapist/upcoming-appointment'
], function(Collection, model) {
	'use strict';

	var UpcomingAppointments = Collection.extend({
		model: model
	});

	return UpcomingAppointments;
});