define([
	'hbs!templates/layout/appointment-details',
	'hbs!templates/patient/appointment-details',
	'stickit',
	'api',
	'conf',
	'moment-timezone',
	'typeahead',
	'tags-input',
	'backbone-validation'
], function(
	therapistAppointmentTpl,
	patientAppointment,
	stickit,
	api,
	conf,
	moment
) {
	'use strict';

	var AppointmentsLayout = Backbone.Marionette.ItemView.extend({
		template: therapistAppointmentTpl,
		el: '.appointment-details-layout',

		ui: {
			cptCode: '#cpt-appointment-txt',
			diagnosisCode: '#diagnosis-appointment-code-txt',
			progressTxt: '#progress-note-txt',
			additionalTxt: '#additional-note-txt',
			providedNotes: '#provided-notes-txt',
			duration: '#duration-txt',
			fee: '#fee-txt',
			confirmPopup: '#summary-note-process-modal',
			form: '#appointment-details-form',
			paymentStt: '.payment-verified-title',
			processErr: '#err-stripe-msg',
			processedTimes: '#processed-times',
			cardAmount: '#card-amount',
			processPM: '#show-process-payment',
			aptTime: '#apppointment-times'
		},

		events: {
			'click #save-appointment-notes': 'saveNotes',
			'click #save-session-details-btn': 'onSaveSession',
			'click #process-payment-btn': 'processPayment',
			'change #duration-txt': 'updateAptTime'
		},

		bindings: {

		},

		serializeData: function() {
			// serialize data for render template
			gon.appointment.user = gon.user;
			if (gon.user.account_type.toLowerCase() === 'patient') {
				gon.appointment.past_appointment = gon.past_appointment;
				gon.appointment.cancel_over_24 = gon.cancel_over_24;
			}
			
			if (gon.appointment.status === 'c') {
				gon.appointment.confirmed = true;
			} else {
				gon.appointment.cancel_over_24 = gon.cancel_over_24;
			}
			gon.appointment.session = gon.session_id;
			if (gon.appointment_processed) {
				gon.appointment.apptProcessed = true;
			}
			gon.appointment.retrieve = gon.retrieve;
			gon.appointment.eligible = gon.eligible;
			gon.appointment.eligible.create_at = moment(new Date(gon.eligible.created_at)).format('MM/DD/YYYY');
			gon.appointment.duration = this.duration;
			gon.appointment.health_insurance_name = gon.health_insurance_name;
			gon.appointment.insurance_ID = gon.insurance_ID;
			gon.appointment.plan_name = gon.plan_name;
			gon.appointment.coverage_verified = gon.coverage_verified;

			return gon.appointment;
		},

		initialize: function() {
			this.headerHeight = 60;
			var self = this;
			if (gon.user.account_type.toLowerCase() === 'patient') {
				this.template = patientAppointment;
			}
			// this.model = new Backbone.Model(gon.appointment);
			// console.log(this.model);
			self.cpt_cdes = [];
			self.icd10_cdes = [];
			_.each(gon.cpt_cdes, function(item) {
				self.cpt_cdes.push(item.code.toString());
			});
			_.each(gon.icd10_cdes, function(item) {
				self.icd10_cdes.push(item.code);
			});

			self.duration = gon.profile.session_duration;

			if (gon.additional_note && gon.additional_note.length > 0)
				this.addNote = gon.additional_note[0];
			else
				this.addNote = gon.additional_note;

			if (gon.progress_note && gon.progress_note.length > 0)
				this.proNote = gon.progress_note[0];
			else
				this.proNote = gon.progress_note;

			// only for therapist
			if (gon.user.account_type.toLowerCase() === 'therapist') {
				this.data = {
					session_log: {
						appointment_id: gon.session_id.appointment_id,
						session_id: gon.session_id.session_id,
						therapist_id: gon.session_id.therapist_id,
						patient_id: gon.session_id.patient_id,
						cpt_codes: gon.session_id.cpt_codes,
						icd10_codes: gon.session_id.icd10_codes,
						therapist_declared_duration: gon.session_id.therapist_declared_duration,
						service_provided_notes: gon.session_id.service_provided_notes,
						changed_fee_amt: gon.appointment.fee_amount
					}
				};
			}

			if ((gon.appointment.canceled_by === 'patient' && gon.session_id.changed_fee_amt && Number(gon.session_id.changed_fee_amt) === 0) || gon.appointment.canceled_by === 'therapist') {
				this.hideProcessPmBtn = true;
			}
			
			this.render();
		},

		updateAptTime: function() {
			var time = this.ui.aptTime.text();
			var endtime = time.split('-');
			endtime = endtime[0].split(',');
			endtime = [endtime[0], endtime[1]].join('');
			endtime = moment(endtime).add(Number(this.ui.duration.val())/60, 'hour').format('h:mm A');
			time = time.split('-');
			this.ui.aptTime.html([time[0], endtime].join('-'));
			console.log(endtime);
		},

		saveNotes: function() {
			var progressTxt = this.ui.progressTxt.val().trim(),
					additionalTxt = this.ui.additionalTxt.val().trim();

			// save progress notes
			this.onSaveNote(progressTxt, 'progress');

			// save additional notes
			this.onSaveNote(additionalTxt, 'additional');

		},

		confirmProcessPayment: function() {
			console.log('Process Payment');
			this.ui.confirmPopup.modal('show');
		},

		processPayment: function() {
			var self = this,
					data = {
						authenticity_token: conf.token,
						appointment_id: gon.session_id.appointment_id,
						amount: this.data.session_log.changed_fee_amt * 100 // in cent => change to USD to save 
					};
			if (this.processPM) {
				console.log(data);
				this.saveSession(function() {
					data.amount = self.data.session_log.changed_fee_amt * 100;
					api.post('/charges/chargecustomer.json', data, function(err, res) {
						console.log(err, res);
						if (res && res.success) {
							self.ui.processErr.hide();
							self.ui.form.addClass('processed');
							self.ui.paymentStt.html('Payment Processed');
							self.ui.processedTimes.html(moment().format('ll'));
							self.ui.cardAmount.html(self.data.session_log.changed_fee_amt);
							self.ui.confirmPopup.modal('hide');
						} else if (res && res.message) {
							self.ui.processErr.html(res.message);
							self.ui.processErr.show();
						}

					});

				});
			}

		},

		onSaveSession: function() {
			this.saveSession();
		},

		saveSession: function(callback) {
			var self = this,
					fee = this.ui.fee.val().trim();
			this.data = {
				session_log: {
					appointment_id: gon.session_id.appointment_id,
					session_id: gon.session_id.session_id,
					therapist_id: gon.session_id.therapist_id,
					patient_id: gon.session_id.patient_id,
					cpt_codes: this.ui.cptCode.val().trim(),
					icd10_codes: this.ui.diagnosisCode.val().trim(),
					therapist_declared_duration: this.ui.duration.val().trim(),
					service_provided_notes: this.ui.providedNotes.val().trim(),
					changed_fee_amt: fee
				}
			};

			if (fee.match('^[0-9]+$') || fee === '' || !fee) {
				this.ui.fee.closest('.form-group').removeClass('has-error');
				api.put('/session_log/' + gon.session_id.session_id + '.json', this.data, function(err, res) {
					console.log(err, res);
					if (res) {
						self.successSavedSetting();
						self.duration = self.data.session_log.therapist_declared_duration;
						self.ui.cardAmount.html(self.data.session_log.changed_fee_amt);
						if (callback)
							callback();
					}
				});
			} else {
				this.ui.fee.closest('.form-group').addClass('has-error');

				//scroll to error filed
				var top = this.ui.fee.offset().top - this.headerHeight;
				$("html, body").animate({ scrollTop: top }, 300);
			}
		},

		onSaveNote: function(val, type) {
			var self = this,
					notes;
			if (type === 'progress') {
				notes = self.proNote;
			} else {
				notes = self.addNote;
			}

			var data = {
						note: {
							therapist_id: gon.session_id.therapist_id,
							patient_id: gon.session_id.patient_id,
							id: notes.id,
							session_id: gon.session_id.session_id,
							note: val,
							note_type: type,
							authenticity_token: conf.token
						}
					};

			if (!notes.id) {
				// create new note
				if (val) {
					api.post('/notes.json', data, function(err, res) {
						console.log(err, res);
						if (res) {
							if (type === 'progress')
								self.proNote = res.note;
							else
								self.addNote = res.note;

							self.successSavedSetting();
						}
					});
				}
			} else {
				// update note
				api.put(['/notes/', notes.id, '.json'].join('') , data, function(err, res) {
					console.log(err, res);
					if (res) {
						if (type === 'progress')
							self.proNote = res.note;
						else
							self.addNote = res.note;
						self.successSavedSetting();
					}
				});
			}

		},

		successSavedSetting: function() {
			// fadein success notification
			var notification = $('#sub-header-notification');
			notification.show();
			notification.addClass('themed-background-success').fadeIn('slow');
			notification.find('.content').html('Changes saved');
			$("body, html").animate({ scrollTop: 0 }, 300);

			// fadeon success notification after 10s
			setTimeout(function() {
				notification.fadeOut('slow');
			}, 10000);
		},

		onRender: function() {
			console.log('App.Render: Appointment details');

			// check to show Process payment button
			var currentTime = moment.tz((moment().format('L') + ' ' + moment().format('HH:mm')), 'Etc/UTC ').utc().format();
			currentTime = Date.parse(currentTime);

			var endTime = moment.tz(gon.appointment.date + ' ' + gon.appointment.end_time,  'Etc/UTC').utc().format();
			endTime = Date.parse(endTime);

			if (gon.appointment_processed || (gon.cancel_over_24 && gon.appointment.canceled_by === 'therapist') || (currentTime < endTime && gon.appointment.status === 'c') || this.hideProcessPmBtn) {
				this.ui.processPM.remove();
			} else {
				this.processPM = true;
			}

			var self = this;
			$('#nav-appointment').addClass('active');

			// render notes content
			if (gon.user.account_type.toLowerCase() === 'therapist') {
				this.ui.progressTxt.html(this.proNote.note);
				this.ui.additionalTxt.html(this.addNote.note);
				
	      this.ui.duration.chosen({width: "100%"});

				// initialize autocomplete search
				// implement tagsinput
				console.log(self.cpt_cdes, self.icd10_cdes);
	      this.ui.cptCode.tagsinput({
	      	typeahead: {
						source: self.cpt_cdes,
	        	items: 20
				  }
	      });
	      this.ui.diagnosisCode.tagsinput({
	      	typeahead: {
						source: self.icd10_cdes,
	        	items: 20
				  }
	      });
				
			}

			// this.stickit();
		}
	});

	return AppointmentsLayout;
});