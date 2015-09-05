define([
	'hbs!templates/therapist/past-appointment',
	'conf'
], function(
	pastAppointmentTpl,
	conf
) {
	'use strict';
	var PastAppointmentView = Backbone.Marionette.ItemView.extend({
		template: pastAppointmentTpl,
		tagName: 'div',
		className: 'data-row',

		initialize: function() {
			if (gon.user.account_type.toLowerCase() === 'therapist') {
				this.model.set('isTherapist', true);
			}
		}
	});

	return PastAppointmentView;
});