define([
	//templates
	'hbs!templates/therapist/therapist-profile/therapist-profile',
	//views
	'views/layout/sidebar',
	'text!data/speciality.json',
	'conf',
	'backbone-eventbroker',
	'moment',
	'views/patient/payment/payment-view',
	// 'jquery-ui',
	'moment-timezone',
	// 'jquery-migrate',
	// 'jquery-ui',
	'fullcalendar'
], function(
	therapistProfileTpl,
	SidebarView,
	specialityJSON,
	conf,
	EventBroker,
	moment,
	PatientPayment
) {
	'use strict';

	var TherapistProfile = Backbone.Marionette.ItemView.extend({

		template: therapistProfileTpl,

		el: '.public-profile-container',

		events: {
			'click .video-show': 'showModelVideo',
			'click #schedule-appointment-btn': 'showPatientPaymentView',
			'click .btn-info': 'openCurrentWeek',
			'click #cancel-appointment-btn': 'cancelAppointment'
		},

		ui: {
			videoContainer: '.video-container',
			aboutMe : '.about-me',
			iframe: 'iframe',
			bookingModal: '#appointment-booking-modal',
			calendar: '#calendar',
			week: '.fc-button-agendaWeek',
			fcHeader: '.fc-header-left'
		},

		initialize: function() {
			
			this.render();

			EventBroker.register({
				'login:success':  'onLoginSuccess'
			}, this);

		},

		serializeData: function() {
			// initilize profile data based on gon
			//specialityJSON = JSON.parse(specialityJSON);
			this.profileInfor = {
				therapist: {
					email: gon.therapist_email,
					gender: gon.therapist.gender,
					picture_filelink: gon.therapist.picture_filelink.url,
					session_duration: gon.therapist.session_duration,
					therapist_profile_attributes: {
						id: gon.therapist_profile ? gon.therapist.therapist_id : null,
						about_me: gon.therapist_profile ? gon.therapist_profile.about_me : '',
						education: gon.therapist_profile ? gon.therapist_profile.education : '',
						prof_memberships: gon.therapist_profile ? gon.therapist_profile.prof_memberships : '',
						experience_years: gon.therapist_profile ? gon.therapist_profile.experience_years : '',
						treatment_approach: gon.therapist_profile ? gon.therapist_profile.treatment_approach : '',
						demographics_served: gon.therapist_profile ? gon.therapist_profile.demographics_served : '',
						youtube_link: gon.therapist_profile ? gon.therapist_profile.youtube_link : '',
						charge_for_cancellation: gon.therapist_profile ? gon.therapist_profile.charge_for_cancellation : false,
						additional_expertise: gon.therapist_profile ? gon.therapist_profile.additional_expertise : '',
						sliding_scale: gon.therapist_profile? gon.therapist_profile.sliding_scale: '',
						hourly_rate_max: gon.therapist_profile ? gon.therapist_profile.hourly_rate_max: '',
					},
					therapist_language_attributes: gon.therapist_language,
					therapist_license_attributes: gon.therapist_license,
					therapist_speciality_attributes: gon.therapist_speciality,
					therapist_accept_insurance_attributes: gon.therapist_accept_insurance,

					therapist_user_profile: gon.therapist,
					speciality: gon.speciality_cdes,
					language_cdes: gon.language_cdes,
					insurance_payers_name: gon.insurance_payers_name,
					timezone: conf.timezone


				}

			}

			//youtube_link
			var youtubeLink = this.profileInfor.therapist.therapist_profile_attributes.youtube_link;

			this.profileInfor.therapist.therapist_profile_attributes.youtube_link = conf.videoUrl(youtubeLink);
			//speciality
			
			var newArraySpeciality = conf.compareArraySpeciality();

			this.profileInfor.therapist.speciality = newArraySpeciality;

			//languages spoken
			var newLanguageArray = conf.compareArrayLanguage(this.profileInfor.therapist.therapist_language_attributes,
														this.profileInfor.therapist.language_cdes);


			this.profileInfor.therapist.therapist_language_attributes = newLanguageArray;

			var insurance = conf.insurance(this.profileInfor.therapist.therapist_accept_insurance_attributes,
											this.profileInfor.therapist.insurance_payers_name);

			this.profileInfor.therapist.therapist_accept_insurance_attributes = insurance; 

			//license
			var license = conf.license(gon.therapist_license, gon.license_type_cdes, gon.state_cdes);
			
			this.profileInfor.therapist.therapist_license_atrributes = license

			//sliding_scale
			
			var slidingScale = this.profileInfor.therapist.therapist_profile_attributes.sliding_scale;

			this.profileInfor.therapist.therapist_profile_attributes.sliding_scale = conf.slidingScale(slidingScale);

			//expertise
			var newExpertiseArray = conf.compareArrayAdditionalExpertise();

			// assign additional_expertise
			this.profileInfor.therapist.therapist_profile_attributes.additional_expertise =  newExpertiseArray;

			//treatmentApproachArray
			var treatmentApproachArray = conf.convertArray(this.profileInfor.therapist.therapist_profile_attributes.treatment_approach);

			this.profileInfor.therapist.therapist_profile_attributes.treatment_approach = treatmentApproachArray;

			//demographics_served
			var demographicsServedArray = conf.convertArray(this.profileInfor.therapist.therapist_profile_attributes.demographics_served);
				
			//assign demographicsServed
			this.profileInfor.therapist.therapist_profile_attributes.demographics_served = demographicsServedArray;

			//eduacation
			var educationArray = conf.convertArray(this.profileInfor.therapist.therapist_profile_attributes.education);

			this.profileInfor.therapist.therapist_profile_attributes.education = educationArray;

			//prof_memberships
			var profMembershipsArray = conf.convertArray(this.profileInfor.therapist.therapist_profile_attributes.prof_memberships);

			this.profileInfor.therapist.therapist_profile_attributes.prof_memberships = profMembershipsArray;


			console.log(this.profileInfor);

			return this.profileInfor.therapist;
	
		},


		onRender: function() {
			// console.log(moment.tz('2014-07-08 15:30:00', 'Etc/UTC').format());
			// console.log(moment.tz('2014-07-08 15:30:00', 'America/New_York').format());
			// console.log(moment.tz('2014-07-08 15:30:00', 'Asia/Jakarta').format());
			// console.log(moment.utc('2014-07-08T15:30:00+07:00').format());
			console.log(conf.timezone);
			var self = this,
					$videoModal = $('#show-video-modal'),
					$container = $('.content-container');
			//if have not video link, hide video
			if (!this.profileInfor.therapist.therapist_profile_attributes.youtube_link) {

				this.ui.videoContainer.addClass('invisible');

			}

			//fix IE10
			if(this.profileInfor.therapist.therapist_profile_attributes.youtube_link) {

				this.ui.iframe.attr('src', 
					this.profileInfor.therapist.therapist_profile_attributes.youtube_link + '?wmode=transparent&hd=1&rel=0&autohide=1&showinfo=0');
			}
			
			//append about me
			this.ui.aboutMe.append(this.profileInfor.therapist.therapist_profile_attributes.about_me);
			
			//check modal close	

			$videoModal.bind('hidden.bs.modal', function () {
		    	$videoModal.find('iframe').attr('src', '');
			});

			var nameState = '';

			_.each(gon.state_cdes, function(item) {
				if(item.state_id === gon.therapist.state_cde) {
					nameState = item.name
				}
				return nameState;
			});

			var countryCode = gon.therapist.city + ',' + ' ' + nameState; 

			if (gon.therapist.city && nameState) {
				this.$('.icon-location')
	        .tooltip({
	          placement: 'top',
	          title: countryCode
	        });
				
			}
      var date = new Date();
			var d = date.getDate();
			var m = date.getMonth();
			var y = date.getFullYear();
		
			var calendar = this.ui.calendar.fullCalendar({
				header: {
					right: 'prev,next',
					center: 'title',
					left: 'agendaDay',
				},
				selectable: true,
	      editable: true,
	      slotDuration: '00:15:00',
	      scrollTime: '06:00:00',
	      slotEventOverlap: false,
	      droppable: true,
		    defaultView: 'agendaWeek',
		    // disableDragging: true,
		    disableResizing: true,
		    loading: function(bool) {
					$('#loading').toggle(bool);
				},
				eventDrop: function(data) {
					console.log(data);
					self.selectEvent(data.start, data.end, data.allDay, calendar, true);
				},
				select: function(start, end, allDay) {
					console.log(start, end, allDay);
					self.localStartTime = start;
					self.selectEvent(start, end, allDay, calendar);
				}
			});

		},

		selectEvent: function(start, end, allDay, calendar, drop) {
			var self = this;
			self.localStartTime = start;
			var defaultStarttime = moment.tz((moment(start).format('L') + ' ' + moment(start).format('HH:mm')), 'Etc/UTC ').utc();
			self.startTime = defaultStarttime.format('HH:mm');

			var selectedRow = $('.fc-cell-overlay');
			selectedRow.css({'opacity': '0'});
			
			self.date = defaultStarttime.format('YYYY/MM/DD');
			self.endTime = moment([self.date, self.startTime].join(' ')).add(gon.therapist.session_duration/60, 'hour').format('HH:mm');

			console.log(self.startTime, self.endTime, self.date);
			calendar.fullCalendar('removeEvents');
			calendar.fullCalendar('renderEvent',
				{
					title: '',
					start: start,
					end: moment(start).add(Number(gon.therapist.session_duration)/60, 'hour'),
					allDay: false
				}
			);
			$('.fc-event').css({'background-color':'#ff8a16', 'border-color':'#ff8a16'});
		},

		openCurrentWeek: function() {
			console.log('openCurrentWeek');
			var self = this;
			this.ui.bookingModal.removeClass('hidden-calendar');
			// setTimeout(function() {
			// 	$('.fc-button-agendaWeek').click();
			// }, 100);
		},

		showPatientPaymentView: function() {
			var mainHeader = $('.main-header'),
					self = this;
			if (gon.user || mainHeader.hasClass('logged-in')) {
				if ( (gon.user && gon.user.account_type.toLowerCase() === 'patient') || mainHeader.hasClass('patient-logged')) {
					if (this.startTime && this.endTime) {
						var currentTime = moment().format(),
								localStartTime = moment.tz((this.localStartTime).format(), conf.timezone).format();

						console.log(localStartTime, currentTime);
						currentTime = Date.parse(currentTime);
						localStartTime = Date.parse(localStartTime);
						if (currentTime < localStartTime) {
							var data = {
								appointment: {
									start_time: this.startTime,
									end_time: this.endTime,
									date: this.date
								}
							};
							var PatientPaymentView = new PatientPayment(data);
							this.ui.bookingModal.modal('hide');
							$('.top-banner').hide();
							this.$el.hide();
						} else {
							alert('Time must be in the future.');
						}
					}
				} else {
					alert('In order to proceed you need to sign up as a patient');
				}
			} else {
				this.ui.bookingModal.modal('hide');
				$('#login-modal').modal('show');
			}
		},

		showModelVideo: function() {
			var url = this.profileInfor.therapist.therapist_profile_attributes.youtube_link,
				newUrl = url + '?amp;autoplay=1&hd=1&rel=0&autohide=1&showinfo=0';

			$('#show-video-modal').find('iframe').attr('src', newUrl);
		},

		onLogin: function() {
			console.log('onLogin');
		},

		onLoginSuccess: function(res) {
		},

		cancelAppointment: function() {
			this.ui.bookingModal.modal('hide');
		},

		sliceStringAdditionalExpertise: function(array) {
			var newArr = [];

			_.each(array, function (item) {
				var idx = item.indexOf('-'),
					string = item.slice(0, idx);
				newArr.push(string);
			});

			return newArr;
		}

	});
	return TherapistProfile;
});