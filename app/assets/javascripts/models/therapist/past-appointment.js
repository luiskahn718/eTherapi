define([
	'models/base',
	'conf'
], function(Model, conf) {
	'use strict';
	var PastAppointment = Model.extend({
		url: function() {
			return ['appointments/', encodeURIComponent(this.id), '.json?authenticity_token=', conf.token].join('');
		}

	});

	return PastAppointment;
});