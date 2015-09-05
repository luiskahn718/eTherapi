define([
	'hbs!templates/therapist/upcoming-appointment',
	'conf',
	'moment',
  'moment-timezone',
], function(
	upcomingAppointmentTpl,
	conf,
	moment,
	m
) {
	'use strict';
	var UpcomingAppointmentView = Backbone.Marionette.ItemView.extend({
		template: upcomingAppointmentTpl,
		tagName: 'div',
		className: 'data-row',

		ui: {
			sessionBtn: '.btn-warning'
		},

		events: {
			'click .cancel-btn': 'cancelAppointment',
			'click .up-del-btn': 'removeModel'
		},

		initialize: function() {
			if (gon.user.account_type.toLowerCase() === 'therapist')
				this.model.set('isTherapist', true);

			var date = this.model.get('date');

			this.startTime = this.convertToLocalTime(date, this.model.get('start_time'));
			this.endTime = this.convertToLocalTime(date, this.model.get('end_time'));
		},

		removeModel: function() {
			console.log('Remove upcoming appointment');
			var cancelSuccessPopup;
			if (gon.user.account_type.toLowerCase() === 'therapist') {
				this.model.destroy();
				$('#cancel-modal').modal('hide');
				cancelSuccessPopup = $('#cancel-success-modal');
				cancelSuccessPopup.find('.patient-name').html(this.model.get('patient_name'));
			} else {
				cancelSuccessPopup = $('#pt-cancel-success');
				$('#pt-cancel').modal('hide');
				cancelSuccessPopup.find('.patient-name').html(this.model.get('therapist_name'));
			}
			//cancelSuccessPopup.modal('show');

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
			// add model-id to find the model
			// when click confirm YES cancel upcoming appointment
			var cancelPopup;
			if (gon.user.account_type.toLowerCase() === 'therapist') {
				cancelPopup = $('#cancel-modal');
				cancelPopup.find('.patient-name').html(this.model.get('patient_name'));
			}
			else {
				cancelPopup = $('#pt-cancel');
				cancelPopup.find('.patient-name').html(this.model.get('therapist_name'));
			}
			cancelPopup.find('.cancel-confirm-btn').attr('model-id', this.model.get('id'));
		},

		convertToLocalTime: function(date, time) {
      var date = m.tz(date + ' ' + time, conf.timezone).format();
      var localTime = moment(date).zone(date);
      return moment(localTime._d).format('HH:mm');
		},

		onRender: function() {
			console.log('Check time to show Go to session button');
			console.log(this.startTime, this.endTime);
			var self = this,
					start = this.startTime.split(':'),
					end = this.endTime.split(':'),
					currentTime = moment().format(),
					date = self.model.get('date'),
					startTime,
					endTime,
					callTime,
					remainCallingTime,
					remainingTime;

			// reformat time
			start = [start[0], start[1]].join(':');
			end = [end[0], end[1]].join(':');

			// format day
      date = m.tz(date + ' ' + this.model.get('start_time'), conf.timezone).format();
      date = moment(date).zone(date);
      date = moment(date._d).format('YYYY/MM/DD');
      // console.log(date);
			// startTime = moment('2014-07-04 15:36', 'YYYY-MM-DD HH:mm').format();
			// endTime = moment('2014-07-04 16:36', 'YYYY-MM-DD HH:mm').format();
			startTime = moment([date, start].join(' '), 'YYYY-MM-DD HH:mm').format();
			endTime = moment([date, end].join(' '), 'YYYY-MM-DD HH:mm').format();
			callTime = Date.parse(endTime) - Date.parse(startTime);
			remainCallingTime = Date.parse(endTime) - Date.parse(currentTime); 
			remainingTime = Date.parse(startTime) - Date.parse(currentTime) - conf.waitTime;
			// console.log(remainingTime, [self.model.get('date'), time].join(' '));
			// console.log(conf.waitTime+remainingTime, [self.model.get('date'), time].join(' '));
			// console.log(remainingTime, remainCallingTime);

			// check time to show Go to Session button
			if (remainingTime <= 0 && remainCallingTime >= 0) {
				self.ui.sessionBtn.attr('href', '/session_log/join/'+ self.model.get('id'));
					self.ui.sessionBtn.css('display', 'block');
				console.log('help');
				setTimeout(function() {
					Backbone.EventBroker.trigger('upcomingList:remove', self.model);
					Backbone.EventBroker.trigger('pastCancelList:add', self.model);
				}, remainCallingTime);
			} else if (remainingTime > 0) {
				setTimeout(function() {
					self.ui.sessionBtn.attr('href', '/session_log/join/'+ self.model.get('id'));
					self.ui.sessionBtn.css('display', 'block');
					setTimeout(function() {
						Backbone.EventBroker.trigger('upcomingList:remove', self.model);
						Backbone.EventBroker.trigger('pastCancelList:add', self.model);
					}, conf.waitTime + callTime);
				}, remainingTime);
			}
		}
	});

	return UpcomingAppointmentView;
});