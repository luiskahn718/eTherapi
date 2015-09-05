define([
	'collections/base',
	'models/therapist/appointment-request'
], function(Collection, model) {
	'use strict';

	var AppointmentsRequest = Collection.extend({
		model: model

    /*comparator: function(model) {
      return new Date(-model.get('date'));
    }*/
    
	});

	return AppointmentsRequest;
});