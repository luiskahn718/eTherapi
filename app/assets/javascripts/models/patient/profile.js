define([
	'models/base',
	'conf'
], function(Model, conf) {
	'use strict';
	var PatientProfile = Model.extend({
		url: function() {
			console.log(this);
			return ['/patient/', encodeURIComponent(this.get('patient').patient_id), '.json?authenticity_token=', conf.token].join('');
		},

		defaults: {
			mail_address1: ''
		},

		validation: {
			mail_address1: {
				pattern: 'email',
				required: false,
				msg: 'Email Address must be a valid email'
			},
			first_name: {
				required: true
			},
			last_name: {
				required: true
			},
			gender: {
				required: true
			},
			date_of_birth: {
				required: true
			}
		}

	});

	return PatientProfile;
});