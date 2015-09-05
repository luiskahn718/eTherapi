define([
	'hbs!templates/therapist/therapist-patient-profile',
	'api',
	'conf'
], function(
	therapistPatientProfileTpl,
	api,
	conf
) {
	'use strict';

	var TherapistPatientProfile = Backbone.Marionette.ItemView.extend({
		template: therapistPatientProfileTpl,
		el: '.therapist-patient-profile-wrapper',

		ui: {
			intakeTxt: '#tp-intake-note'
		},

		events: {
			'click #save-intake-note': 'saveIntakeNote'
		},

		initialize: function() {
			this.note = gon.patient_note;
			this.render();
		},

		serializeData: function() {
			// add patient_note data for render template
			gon.patient.note = gon.patient_note;
			return gon.patient;
		},

		saveIntakeNote: function() {
			var val = this.ui.intakeTxt.val().trim(),
					self = this,
					data = {
						note: {
							therapist_id: gon.therapist.therapist_id,
							patient_id: gon.patient.patient_id,
							id: self.note.id,
							note: val,
							note_type: 'patient',
							authenticity_token: conf.token
						}
					};

			if (!self.note.id) {
				// create new note
				if (val) {
					api.post('/notes.json', data, function(err, res) {
						if (res) {
							self.note = res.note;
							self.successSavedSetting();
						}
					});
				}
			} else {
				// update note
				api.put(['/notes/', self.note.id, '.json'].join('') , data, function(err, res) {
					if (res) {
						self.note = res.note;
						self.successSavedSetting();
					}
				});
			}

		},

		successSavedSetting: function() {
			// fadein success notification
			var notification = $('#sub-header-notification');
			notification.addClass('themed-background-success').fadeIn('slow');
			notification.find('.content').html('Changes saved');
			$("body, html").animate({ scrollTop: 0 }, 300);

			// fadeon success notification after 10s
			setTimeout(function() {
				notification.fadeOut('slow');
			}, 10000);
		},

		onRender: function() {
			console.log('App.Render.TherapistPatientProfile');
		}

	});

	return TherapistPatientProfile;
});