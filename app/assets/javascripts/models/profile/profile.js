define([
	'models/base',
	'conf'
], function(Model, conf) {
	'use strict';
	var Profile = Model.extend({
		url: function() {
			console.log(this);
			return ['/therapist/', encodeURIComponent(this.get('therapist').therapist_id), '.json?authenticity_token=', conf.token].join('');
		},

		defaults: {

		},

		validation: {
		}

	});

	return Profile;
});