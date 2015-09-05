define(['purl'], function(purl) {
	var AppRouters = Backbone.Marionette.AppRouter.extend({

		run: function() {
			var self = this,
					appointmentId = '',
					patientId = '',
					therapistId = '',
					userId = '';
			console.log('AppRouter.run');
			Backbone.history.start();

			// get current url to render correct view
			var currentRoute = purl(window.href).attr('directory'),
				bLogin = false;

			console.log(currentRoute);
			if (gon) {
				if (gon.appointment)
					appointmentId = gon.appointment.id;

				if (gon.patient)
					patientId = gon.patient.patient_id;

				if(gon.therapist)
					therapistId = gon.therapist.therapist_id;

				if(gon.user)
					userId = gon.user.user_id; 
			} else {
				userId = '';
				patientId = '';
				therapistId = '';
				appointmentId = '';

			}

			switch (currentRoute) {
				case '/':
					self.isPublicPage = true;
					self.showHomepage();
					break;

				case '/site/therapist':
					self.showHomePageTherapist();
					break;

				case '/site/terms':
					self.isPublicPage = true;
					self.showTerms();
					break;

				case '/appointments':
					self.showAppointments();
					break;

				case '/appointments/'+ appointmentId + '/edit':
					self.showAppointmentDetails();
					break;

				case '/session_log/join/'+ appointmentId :
					self.showVideoSession();
					break;

				case '/therapist/'+ userId+ '/edit':
					self.showEditTherapistProfile();
					break;

				case '/therapist/patient/'+ patientId :
					self.showTherapistPatientProfile();
					break;

				case '/profiles/'+ userId :
					self.showAccountInfo();
					break;

				case '/patient/'+ patientId :
					self.showAccountInfo();
					break;

				case '/patient/payment' :
					self.showPatientPayment();
					break;

				case '/therapist/' + therapistId + '/profile':
					self.isPublicPage = true;
					self.showTherapistPublicProfile();
					break;

				case '/patient/' + userId + '/edit':
					self.showEditPatientProfile();
					break;

				case '/therapist/searchresult':
					self.isPublicPage = true;
					self.showSearchTherapist();
					break;

				case '/users/password/edit':
					self.isPublicPage = true;
					self.showResetPassword();
					break;

			}
		},

		showDefaultLayout: function(callback) {
			var isPublicPage = this.isPublicPage;
			require([
				'views/layout/main-layout',
				'views/layout/header',
				'views/layout/sidebar'
			], function(
				TherapistLayout,
				headerView,
				sidebarView
			) {

				// render therapist view
				var TherapistLayoutView = new TherapistLayout({
						isPublicPage: isPublicPage
				});
				TherapistLayoutView.render();

				var $nameUser = $('#header-username'),
						name = $nameUser.text();
						
				if(name) {
					TherapistLayoutView.header.show(new headerView());
					TherapistLayoutView.sidebar.show(new sidebarView());
				}
	
		
				/*if(gon.user) {
					TherapistLayoutView.header.show(new headerView());
					TherapistLayoutView.sidebar.show(new sidebarView());
				}*/
				

				// start render view on router
				if (callback)
					callback();
			});

		},

		showTherapistPublicProfile: function() {
			this.showDefaultLayout(function() {
					// render therepist profile view
					// loading resources needed
					require([
						'views/therapist/therapist-profile/therapist-profile-view'
					], function(
						TherapistProfileView
					) {
						var therapistProfileView = new TherapistProfileView();
					});
			});
		},

		showResetPassword: function() {
			this.showDefaultLayout(function() {
				// render therepist profile view
				// loading resources needed
				require([
					'views/register/reset-password-view'
				], function(
					ResetPasswordView
				) {
					var resetPasswordView = new ResetPasswordView();
				});
			});
		},


		showAppointments: function() {
			// set current view = true for render sidebar url template
			gon.user.appointmentView = true;
			this.showDefaultLayout(function() {
					// render appointment view
					// loading resources needed
					require([
						'views/layout/appointments'
					], function(
						appointmentsView
					) {
						var AppointmentsView = new appointmentsView();
					});
			});
		},

		showAppointmentDetails: function() {
			this.showDefaultLayout(function() {
				// render appointment details view
				// loading resources needed
				require([
					'views/layout/appointment-details',
				], function(AppointmentDetails) {
					var AppointmentsDetailsView = new AppointmentDetails();
				});
			});
		},

		showEditTherapistProfile: function() {
			this.showDefaultLayout(function() {
				// render edit therapist view
				// loading resources needed
				require([
					'views/therapist/edit-profile-view',
				], function(EditTherapistProfile) {
					var EditTherapistProfileView = new EditTherapistProfile();
				});
			});
		},

		showTherapistPatientProfile: function() {
			this.showDefaultLayout(function() {
				// render therapist patient profile view
				// loading resources needed
				require([
					'views/therapist/therapist-patient-profile-view',
				], function(TherapistPatientProfile) {
					var TherapistPatientProfileView = new TherapistPatientProfile();
				});
			});
		},

		showAccountInfo: function() {
			// set current view = true for render sidebar url template
			gon.user.accountInfoView = true;
			this.showDefaultLayout(function() {
				// render account information view
				// loading resources needed
				require([
					'views/layout/account-info',
				], function(AccountInfo) {
					var AccountInfoView = new AccountInfo();
				});
			});
		},

		showEditPatientProfile: function() {
			this.showDefaultLayout(function() {
				// render therapist patient profile view
				// loading resources needed
				require([
					'views/patient/edit-profile',
				], function(PatientProfile) {
					var EditPatientProfileView = new PatientProfile();
				});
			});
		},

		showSearchTherapist: function() {
			this.showDefaultLayout(function(){
				require([
					'views/therapist/search/search-view',
				], function(SearchTherapist) {
					var SearchTherapistView = new SearchTherapist();
				});
			});
		},

		showVideoSession: function() {
			require([
				'views/session/video-session'
			], function(VideoSession) {
				var VideoSessionView = new VideoSession;
			});
		},

		showTerms: function() {
			require([
				'views/layout/home/home-layout'
				// 'views/layout/terms'
			], function(HomeLayout) {
				var Home = new HomeLayout();
				Home.render();
				// var TermsView = new Terms;
			});
		},

		showPatientPayment: function() {
			this.showDefaultLayout(function() {
				// render patient payment view
				// loading resources needed
				require([
					'views/patient/payment/payment-view',
				], function(PatientPayment) {
					var PatientPaymentView = new PatientPayment();
				});
			});

		},

		showHomepage: function() {
			console.log('Show home page view');
			require([
				'views/layout/home/home-layout',
				'views/layout/home/homepage',
			], function(HomeLayout, Homepage) {
				var Home = new HomeLayout();
				Home.render();
				var HomepageView = new Homepage();
			});
		},

		showHomePageTherapist: function() {
			require([
				'views/layout/home/home-layout',
				'views/layout/home/therapist',
			], function(HomeLayout, Therapist) {
				var Home = new HomeLayout();
				Home.render();
				var TherapistHomepageView = new Therapist();
			});
		}

	});

	var app = new AppRouters();
	return app;
});