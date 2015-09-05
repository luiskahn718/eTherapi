define([
	'models/base',
	'conf'
], function(Model, conf) {
	'use strict';
	var AccountInfo = Model.extend({
		url: function() {
			console.log(this);
			return ['/users/update_account', '?authenticity_token=', conf.token].join('');
		},

		defaults: {

		},

		validation: {
			email: {
				required: true,
				pattern: 'email'
			},

			first_name: {
				minLength: 1,
				msg: 'Your first name must consist of at least 1 characters'
			},

			last_name: {
				minLength: 1,
				msg: 'Your last name must consist of at least 1 characters'
			}
		}

	});

	return AccountInfo;
});