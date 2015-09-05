define([
	'api',
	'conf',
	'moment',
	'moment-timezone',
	'views/session/pubnub',
	'views/session/vseepresence',
	'views/session/vseedetect',
	'clock'
], function(
	api,
	conf,
	moment,
	m
) {
	'use strict';
	var VideoSessionView = Backbone.Marionette.ItemView.extend({
		template: '#session-log-container',
		el: '#session-log-container',

		ui: {
			startSsBtn: '#start-session-btn',
			avatar: '#user-avatar',
			startTime: '#start-time',
			endTime: '#end-time',
			currentTime: '#current-time',
			notesBtn: '.toggle-link',
			note: '#session-note-txt',
			endSessionBtn: '#end-session-btn',
			offline: '#offline-txt',
			endedTime: '#ended-txt',
			sessionStatus: '#session-status-wrapper'
		},

		events: {
			'click #start-session-btn': 'startCall',
			'click #end-session-btn': 'endCall',
			'click #save-notes': 'onSaveNotes'
		},

		initialize: function() {

			if (gon.notes.length > 0)
				this.note = gon.notes[0];
			else
				this.note = gon.notes;
			
			this.render();
		},

		startCall: function() {
			console.log('Start call');
			this.ui.startSsBtn.html('Exit Session');
			this.ui.startSsBtn.attr('id', 'end-session-btn');
		},

		endCall: function() {
			console.log('End call');
			var self = this;
			// get vsee exit href data
			if (!self.exitVsee) {
				self.ui.startSsBtn.attr('href', 'javascript:void(0)');
				api.get('/session_log/getVSeeExitURI.json', function(err, res) {
					console.log(err, res);
					if (res) {
						self.exitVsee = res.data;
						self.ui.startSsBtn.attr('href', res.data);
						self.ui.endSessionBtn.click();
						window.location = res.data;
						setInterval(function() {
							window.location = '/appointments';
						}, 3000);
					}
				});
			}
		},

		detectVsee: function() {
			var detector = new VSeeDetect({ debug: true, debugSwf: false }),
					attemptNum = 0;

			attemptNum += 1;
      detector.isVSeeInstalled(function(installed, data) {
      	console.log(installed, data);
          if (installed !== "installed") {
          	window.open(detector.getVSeeDownloadURL(), '_blank');
          }
      });
		},

		changeTimeFormat: function(value, defaultTime) {
			var date = m.tz(gon.appointment.date + ' ' + value, conf.timezone).format();
      var localTime = moment(date).zone(date);
      if (defaultTime)
      	return moment(localTime._d).format('hh:mm A');
    	else
      	return moment(localTime._d).format('H:mm');
		},

		onSaveNotes: function() {
			var val = this.ui.note.val().trim(),
					self = this,
					data = {
						note: {
							therapist_id: gon.session_id.therapist_id,
							patient_id: gon.session_id.patient_id,
							id: self.note.id,
							session_id: gon.session_id.session_id,
							note: val,
							note_type: 'additional',
							authenticity_token: conf.token
						}
					};

			if (!self.note.id) {
				// create new note
				if (val) {
					api.post('/notes.json', data, function(err, res) {
						console.log(err, res);
						if (res) {
							self.note = res.note;
							self.successSavedSetting();
						}
					});
				}
			} else {
				// update note
				api.put(['/notes/', self.note.id, '.json'].join('') , data, function(err, res) {
					console.log(err, res);
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
			notification.show();
			notification.addClass('themed-background-success').fadeIn('slow');
			notification.find('.content').html('Changes saved');
			$("body, html").animate({ scrollTop: 0 }, 300);

			// fadeon success notification after 10s
			setTimeout(function() {
				notification.fadeOut('slow');
			}, 10000);
		},

		checkRemainingTime: function() {
			console.log('check remaining time');
			var self = this,
					currentTime = moment().format(),
					changeStartTime = this.changeTimeFormat(gon.appointment.start_time),
					changeEndTime;
			if (gon.session_id.therapist_declared_duration) {
      	changeEndTime = moment(gon.appointment.date + ' ' + gon.appointment.start_time).add(Number(gon.session_id.therapist_declared_duration)/60, 'hour').format('H:mm');
			} else {
				changeEndTime = this.changeTimeFormat(gon.appointment.end_time);
			}

			var start = changeStartTime.split(':'),
					end = changeEndTime.split(':'),
					currentTime = moment().format(),
					date = gon.appointment.date,
					startTime,
					endTime,
					callTime,
					remainCallingTime;


			// format day
      date = m.tz(date + ' ' + gon.appointment.start_time, conf.timezone).format();
      date = moment(date).zone(date);
      date = moment(date._d).format('YYYY/MM/DD');

			// reformat time
			start = [start[0], start[1]].join(':');
			end = [end[0], end[1]].join(':');
			startTime = moment([date, start].join(' '), 'YYYY-MM-DD HH:mm').format();
			endTime = moment([date, end].join(' '), 'YYYY-MM-DD HH:mm').format();
			callTime = Date.parse(endTime) - Date.parse(startTime) + conf.waitTime;
			remainCallingTime = Date.parse(endTime) - Date.parse(currentTime);
			console.log(remainCallingTime, callTime);
			if (remainCallingTime < callTime && remainCallingTime >= 0) {
				console.log('Remainging call time:', remainCallingTime);
				if (gon.user.account_type.toLowerCase() === 'patient') {
					self.ui.startSsBtn.css('display', 'block');
				}
				setTimeout(function() {
					// api.get('/session_log/getVSeeExitURI.json', function(err, res) {
						// window.location = '/appointments';
					// });
					self.ui.sessionStatus.find('a').hide();
					self.ui.endedTime.css('display', 'block');
				}, remainCallingTime);
			} else {
				self.timeout = true;
				self.ui.sessionStatus.find('a').hide();
				self.ui.endedTime.css('display', 'block');
				window.location = '/appointments';
			}
			setTimeout(function() {
				self.startVsee();
			}, 200);
		},

		startVsee: function() {
			var self = this;
			if (!self.timeout) {
				// initialize VSee
				this.detectVsee();
				this.vseePresence = new VSeePresence();

				var vUsername = 'etherapi+d'+ gon.patient_user_id;
				console.log(vUsername);
				if (gon.user.account_type.toLowerCase() === 'therapist') {
					this.ui.startSsBtn.attr('username', vUsername);
					this.ui.startSsBtn.vsee('showByPresence');
					this.ui.offline.attr('username', vUsername);
					this.ui.offline.vsee('presenceClasses');

					this.vseePresence.subscribe(vUsername, function(status) {
						console.log(status);
						if (status == 'Available' || status == 'Idle' || status == 'Busy'|| status == 'Inacall') {
							self.ui.startSsBtn.css('display', 'block');
							self.ui.offline.hide();
						} else {
							self.ui.startSsBtn.hide();
							self.ui.offline.css('display', 'block');
						}

						if (status == 'Inacall') {
							self.inCall = true;
						}
						if (self.inCall && status != 'Inacall') {
							window.location = '/appointments';
						}

					});
				} else {

					this.vseePresence.subscribe(vUsername, function(status) {
						console.log(status);
						if (status == 'Inacall') {
							self.inCall = true;
						}
						if (self.inCall && status != 'Inacall') {
							window.location = '/appointments';
						}
					});

				}

				setTimeout(function() {
					console.log(self.vseePresence.getUserState(vUsername));
					self.vseePresence.getUserState(vUsername);
				}, 5000);

				// get vsee href data
				api.get(['/session_log/join/', gon.appointment.id, '.json'].join(''), function(err, res) {
					console.log(err, res);
					if (res) {
						self.vseeStartUrl = res.data;
						self.ui.startSsBtn.attr('href', res.data);
					}
				});
			}

		},

		onRender: function() {
			console.log('App.Render: Video session');
			var self = this;

			// update template
			this.ui.startTime.html(this.changeTimeFormat(gon.appointment.start_time, true));
			if (gon.session_id.therapist_declared_duration) {
				var stTime  = m.tz(gon.appointment.date + ' ' + gon.appointment.start_time, conf.timezone).format();
	          stTime = moment(stTime).zone(stTime);

	      var endTime = moment(stTime._d).add(Number(gon.session_id.therapist_declared_duration)/60, 'hour').format('h:mm A');
				this.ui.endTime.html(endTime);
			} else {
				this.ui.endTime.html(this.changeTimeFormat(gon.appointment.end_time, true));
			}
			this.ui.currentTime.MyDigitClock({
				fontSize: 13,
				fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
				fontColor: "#3a3b3b",
				fontWeight: 'normal',
				bAmPm: true,
				bShowHeartBeat: false
			});

			self.checkRemainingTime();
				

			// initialize collapse session notes
			if (gon.user.account_type.toLowerCase() === 'therapist') {
				this.ui.notesBtn.attr('data-target', '#session-note');
				this.ui.notesBtn.attr('data-toggle', 'collapse');
				this.ui.notesBtn.collapse();
				this.ui.note.html(self.note.note);
			}
		}
	});

	return VideoSessionView;
	
});