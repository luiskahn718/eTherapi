define([
	'hbs!templates/therapist/appointment-request',
	'conf',
	'api',
	'chosen'
], function(
	appointmentRequestTpl,
	conf,
	api
) {
	'use strict';
	var AppointmentRequestView = Backbone.Marionette.ItemView.extend({
		template: appointmentRequestTpl,
		tagName: 'div',
		className: 'data-row',

		events: {
			'click .btn-success': 'confirmAppointment',
			'click .request-del-btn': 'declineAppointment',
			'click .request-cancel-btn': 'removeModel',
			'click .cancel-btn': 'cancelAppointment',
			'click .decline-appointment': 'showDeclineConfirmPopup'
		},

		initialize: function() {
			if (gon.user.account_type.toLowerCase() === 'therapist') {
				this.model.set('isTherapist', true);
				this.listPatient = gon.patientlist;
			}
		},

		confirmAppointment: function() {
			console.log('Confimr Appointment', this.model);
			var confirmPopup = $('#confirm-modal'),
				patientId = this.model.get('patient_id'),
				newPatient = {}, 
				self = this;

			confirmPopup.find('.patient-name').html(this.model.get('patient_name'));
			Backbone.EventBroker.trigger('appointmentRequest:remove', this.model);
			this.model.set('status', 'c');
			Backbone.EventBroker.trigger('upcomingList:add', this.model);

			if (this.listPatient.length > 0) {
				_.each(this.listPatient, function(item) {
					if(patientId == item.patient_id) {
						self.isNotHasNewPatient = true;
					} 		
				});
				if (!this.isNotHasNewPatient) {
					this.isFirstNewPatient = false;
					newPatient = {
						first_name: self.model.get('patient').first_name,
						last_name: self.model.get('patient').last_name,
						patient_id: patientId
					}
				}
			} else {
				this.isFirstNewPatient = true;
				newPatient = {
					first_name: self.model.get('patient').first_name,
					last_name: self.model.get('patient').last_name,
					patient_id: patientId
				}
			}
			var $selectListPatient = $('#search-patient-txt');

			// if has new patient
			if (newPatient.first_name && !this.isFirstNewPatient) {
				this.listPatient.push(newPatient);

				var listPatientSort = this.sortPatientList(this.listPatient);
					
				console.log('listPatientSort', listPatientSort);

				$selectListPatient.html('');
				$selectListPatient.append('<option value="">Search Patients</option>');
				_.each(listPatientSort, function (item) {
					$selectListPatient.append(['<option value="/therapist/patient/', item.patient_id, '">', item.first_name,' ', item.last_name, '</option>'].join(''));
				});
				$selectListPatient.chosen({width: "100%"});
				$selectListPatient.trigger("chosen:updated");

			} else if (newPatient.first_name && this.isFirstNewPatient) {
				$selectListPatient.append(['<option value="/therapist/patient/', newPatient.patient_id, '">', newPatient.first_name,' ', newPatient.last_name, '</option>'].join(''));
				$selectListPatient.chosen({width: "100%"});
				$selectListPatient.trigger("chosen:updated");
			}

		},

		sortPatientList: function(patientList) {
			var newList = _.sortBy(patientList, function(item) {
				return item.last_name
			});

			return newList;
		},

		showDeclineConfirmPopup: function() {
			// add model-id to find the model
			// when click confirm YES, decline appoitment
			var declinePopup = $('#decline-modal');
			declinePopup.find('.decline-request-btn').attr('model-id', this.model.get('id'));
			declinePopup.find('.patient-name').html(this.model.get('patient_name'));
		},

		declineAppointment: function() {
			this.model.save({status: 'd'});
			$('#decline-modal').modal('hide');
			/*var declineSuccessPopup = $('#decline-success-modal');
			declineSuccessPopup.find('.patient-name').html(this.model.get('patient_name'));
			declineSuccessPopup.modal('show');*/
			
			// fadein success notification
			var notification = $('#sub-header-notification');
			notification.addClass('themed-background-success').fadeIn('slow');
			notification.find('.content').html('Action Submitted');
			$("body, html").animate({ scrollTop: 0 }, 300);

			// fadeon success notification after 10s
			setTimeout(function() {
				notification.fadeOut('slow');
			}, 10000);
		},

		cancelAppointment: function() {
			var	cancelPopup = $('#pt-pending-cancel');
			cancelPopup.find('.cancel-pending-btn').attr('model-id', this.model.get('id'));
			cancelPopup.find('.patient-name').html(this.model.get('therapist_name'));
		},

		removeModel: function() {
			var cancelSuccessPopup;
			cancelSuccessPopup = $('#pt-cancel-success');
			$('#pt-pending-cancel').modal('hide');
			cancelSuccessPopup.find('.patient-name').html(this.model.get('therapist_name'));
			cancelSuccessPopup.modal('show');
		},
	});

	return AppointmentRequestView;
});