define([
	'collections/base',
	'models/therapist/past-appointment'
], function(Collection, model) {
	'use strict';

	var PastAppointments = Collection.extend({
		model: model
	});

	return PastAppointments;
});