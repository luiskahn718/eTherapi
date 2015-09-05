define([
	'models/base',
	'conf'
], function(Model, conf) {
	'use strict';
	var AppointmentRequest = Model.extend({
		url: function() {
			return ['appointments/', encodeURIComponent(this.id), '.json?authenticy_token=', conf.token].join('');
		}

	});

	return AppointmentRequest;
});