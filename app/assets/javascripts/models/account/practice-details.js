define([
	'models/base',
	'conf'
], function(Model, conf) {
	'use strict';
	var PracticeDetails = Model.extend({
		url: function() {
			console.log(this);
			return ['/therapist/', encodeURIComponent(this.get('therapist_id')), '.json?authenticity_token=', conf.token].join('');
		},

		defaults: {

		},

		validation: {
			address1: {

			},

			city: {

			},

			state_cde: {

			},

			country_cde: {
				required: true
			},

			zipcode:  {
				required: true
			},

			phone_home: {
				pattern: 'phone',
				msg: 'Please enter a valid phone number'
			},

			// timezone: {
			// 	required: true
			// },

			/*npi_no:[
				{
					pattern: 'number',
					msg: 'Please enter a valid number'
				},{
					max: 9999999999,
					msg: 'The max is 10 digits'
				}
			], */

			gender: {
				required: true
			}
		}

	});

	return PracticeDetails;
});