define([
	'hbs!templates/layout/account-info',
	'hbs!templates/layout/patient-account',
	'models/account/practice-details',
	'models/account/account-info',
	'models/account/billing-model',
	'backbone-eventbroker',
	'purl',
	'api',
	'conf',
	'stickit',
	'views/patient/billing/list-card',
	'views/patient/billing/del-card-view-modal',
	'typeahead',
	'chosen',
	'backbone-validation',
	'maskedInput'
], function(
	accountInfoTpl,
	patientAccountTpl,
	practiceDetailsModel,
	accountInfoModel,
	BillingModel,
	EventBroker,
	purl,
	api,
	conf,
	stickit,
	ListCard,
	ModalConfirmDeleteCard
) {
	'use strict';
	var EditProfileView = Backbone.Marionette.ItemView.extend({
		template: accountInfoTpl,
		el: '.account-info-wrapper',

		ui: {
			affixMenu: '.affix-menu-nav',
			accountInfoSection: '#account-info-section',
			practiceDetailsSection: '#practice-details-section',
			intakeFormsSection: '#intake-forms-section',
			changePassSection: '#change-password-section',
			pwd: '#pwd-txt',
			confirmPwd: '#confirm-pwd-txt',
			pwdErrTxt: '#pwd-error-txt',
			stateTxt: '#pd-state-txt',
			country: '#country_cde',
			timezone: '#timezone',
			lastName: '#last_name',
			firstName: '#first_name',
			email: '#email',
			intakeForm: '#th-intake-modal',
			intakeTxt: '#intake-txt',
			ssn: '#pd_ssn',
			addCardBtn: '.add-more',
			addCardPopup: '#patient-add-card',
			cardNumb: '#card-number-txt',
			cardName: '#card-name-txt',
			cardExpMon: '#card-exp-mon',
			cardExpYear: '#card-exp-year',
			cvc: '#cvc_txt',
			errMsg: '#err-stripe-msg',
			phone: '#phone_home',
			saveCardBtn: '#save-card-btn'
		},

		events: {
			'click .account-info-section': 'scrollTAccountInfo',
			'click .practice-details-section': 'scrollToPracticeDetails',
			'click .intake-forms-section': 'scrollToIntakeForms',
			'click .change-password-section': 'scrollToChangePassword',
			'click #save-pwd-btn': 'onSavePassword',
			'click #save-practice-details-btn': 'onSavePracticeDetails',
			'click #save-acc-info-btn': 'onSaveAccInfo',
			'click #intake-btn': 'showIntakeForm',
			'click #update-consent-btn': 'onSaveIntakeFormContent',
			'click .add-more': 'showAddCardPopup',
			'click #save-card-btn': 'addCard',
			'change #country_cde': 'changeSelectCountryCode'
		},

		bindings: {
			'#address1': 'address1',
			'#city': 'city',
			'#pd-state-txt': 'state_cde',
			'#zipcode': 'zipcode',
			'#country_cde': 'country_cde',
			'#phone_home': 'phone_home',
			'#timezone': 'timezone',
			'#npi_no': 'npi_no',
			'#pd_ssn': 'pd_ssn',
			'#cvc_txt': 'cvc_txt',
			'#card-exp-mon': 'card-exp-mon',
			'#card-exp-year': 'card-exp-year'
		},

		initialize: function() {
			// change the template if the account_type is patient
			if (gon.user.account_type.toLowerCase() === 'patient') {
				this.template = patientAccountTpl;
				this.profile = gon.patient;
				this.model = new BillingModel();
			} else {
				this.profile = gon.profile;
				if (gon.therapist_profile) {
					this.profile.pd_ssn = gon.therapist_profile.ssn;
				}
				// create practice details model for backbone validation
				this.model = new practiceDetailsModel(this.profile);
			}
			this.headerHeight = 60;

			// backbone events broker
			EventBroker.register({
				'account-info:scroll': 'scrollTAccountInfo',
				'practice-details:scroll': 'scrollToPracticeDetails',
				'intake-forms:scroll': 'scrollToIntakeForms',
				'change-pass:scroll': 'scrollToChangePassword'
			},this);


			// create account info model for backbone validation
			this.accModel = new accountInfoModel({
				email: gon.user.email,
				first_name: gon.user.first_name,
				last_name: gon.user.last_name
			});
			this.therapist_consent = gon.therapist_consent;
			this.therapist_profile = gon.therapist_profile;

			//new modal confirm delete card
			this.modalConfirmDeleteCard = new ModalConfirmDeleteCard();

			this.render();
		},

		serializeData: function() {
			this.profile.countryCode = gon.country_cdes;
			this.profile.stateCode = gon.state_cdes;
			this.profile.consent = gon.therapist_consent;
			this.profile.email = gon.user.email;
			return this.profile;
		},

		changeSelectCountryCode: function() {
			var value = this.model.get('country_cde'),
				mask = "999-999-9999",
				phoneValue = this.model.get('phone_home');
			if(parseInt(value) == 233) {
				this.ui.phone.mask(mask);
				this.model.set('phone_home', '');
			}else {
				this.ui.phone.unmask(mask);
				this.ui.phone.attr('placeholder', ' ');
				this.model.set('phone_home', phoneValue);
			}
		},

		scrollTAccountInfo: function() {
			var top = this.ui.accountInfoSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToPracticeDetails: function() {
			var top = this.ui.practiceDetailsSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToChangePassword: function() {
			var top = this.ui.changePassSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToIntakeForms: function() {
			var top = this.ui.intakeFormsSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		showIntakeForm: function() {
			this.ui.intakeForm.modal('show');
		},

		onSaveIntakeFormContent: function() {
			var self = this,
					url,
					id,
					data = {
						consent_text: this.ui.intakeTxt.val().trim(),
						therapist_id: this.profile.therapist_id
					};
			if (self.therapist_consent && self.therapist_consent.id) {
				data.id = self.therapist_consent.id;
				url = ['/therapist_consents/', data.id,'.json?authenticity_token=', conf.token].join('');
				api.put(url, data, function(err, res) {
					console.log(err, res);
					if (res) {
						self.therapist_consents = res.therapist_consent;
						self.ui.intakeForm.modal('hide');
						self.successSavedSetting();
					}
				});
			} else {
				url = ['/therapist_consents?authenticity_token=', conf.token].join('');
				api.post('/therapist_consents', data, function(err, res) {
					console.log(err, res);
					self.therapist_consents = res.therapist_consent;
					self.ui.intakeForm.modal('hide');
					self.successSavedSetting();
				});
			}
		},

		onSavePassword: function() {
			console.log('Change password');
			var self = this,
					pwdTxt = this.ui.pwd.val().trim(),
					confirmPwdTxt = this.ui.confirmPwd.val().trim();
			if (pwdTxt && confirmPwdTxt) {
				var data = {
					authenticity_token : conf.token,
					password: pwdTxt,
					password_confirmation: confirmPwdTxt
				}

				// save password
				api.put('/users/update_password.json', data, function(err, res) {
					console.log(err, res);
					if (err) {
						self.ui.pwdErrTxt.html(JSON.parse(err.responseText)[0]);
						self.ui.pwd.closest('.form-group').addClass('has-error');
						self.ui.confirmPwd.closest('.form-group').addClass('has-error');
					} else {
						self.ui.pwd.closest('.form-group').removeClass('has-error');
						self.ui.confirmPwd.closest('.form-group').removeClass('has-error');
						self.ui.pwd.val('');
						self.ui.confirmPwd.val('');
						self.successSavedSetting();
					}
				});

			} else {
				self.ui.pwdErrTxt.html('Please provide a password');
				self.ui.pwd.closest('.form-group').addClass('has-error');
				self.ui.confirmPwd.closest('.form-group').addClass('has-error');
			}
		},

		onSavePracticeDetails: function() {
			var valueCountry = this.model.get('country_cde') ||this.ui.country.val();

			if (parseInt(valueCountry) === 233) {
				console.log('validation for US')
				this.model.validation = {
					npi_no: [{
							required: true,
							msg: 'NPI is required'
						},{
							pattern: 'number',
							msg: 'Please enter a valid number'
						},{
							pattern: 'npi',
							msg: 'NPI don\'t accept more than 10 digits'
						}
					],

					pd_ssn: {
						required: true,
						msg: 'Social Security Number is required'
					},

					country_cde: {
						required: true
					},

					zipcode:  {
						required: true
					},

					phone_home: {
						required: true,
						msg: 'Phone number is required'
					}
				}

			} else {
				console.log('validation for # US')
				this.model.validation = { 
					npi_no: [{
							required: false,
						},{
							pattern: 'number',
							msg: 'Please enter a valid number'
						},{
							pattern: 'npi',
							msg: 'NPI don\'t accept more than 10 digits'
						}
					], 
					pd_ssn: {
						required: false
					},
					country_cde: {
						required: true
					},

					zipcode:  {
						required: true
					},

					phone_home: [{
						required: true,
						msg: 'Phone number is required'
					},{
						pattern: 'number',
						msg: 'Please enter a number'
					}]
				}
			}
			var ssn = '';

			if (this.model.get('pd_ssn')) {
				ssn = this.model.get('pd_ssn').split('-').join('');
			}
			// validate value
			if (this.therapist_profile) {
				this.model.set('therapist_profile_attributes', {
					id: this.model.get('therapist_id'),
					ssn: ssn
				});
			} else {
				this.model.set('therapist_profile_attributes', {
					ssn: ssn
				});
			}

			this.model.set('therapist', this.model.toJSON());

			var self = this,
					isValid = this.model.isValid(true);
			if (isValid) {
				this.model.sync("update", this.model, {
					success: function(res) {
						console.log('Saved success', res);
						self.therapist_profile = res.therapist_profile;
						self.successSavedSetting();
					}
				});
				
			}
			
		},

		onSaveAccInfo: function() {
			this.accModel.set('email', this.ui.email.val().trim());
			this.accModel.set('first_name', this.ui.firstName.val().trim());
			this.accModel.set('last_name', this.ui.lastName.val().trim());
			// validate value
			var self = this,
					isValid = this.accModel.isValid(true);
			if (isValid) {
				this.accModel.sync("update", this.accModel, {
					success: function() {
						console.log('Saved success');
						var username = [self.accModel.get('first_name'), self.accModel.get('last_name')].join(' ');
						$('.sidebar-username').html(username);
						$('#header-username').html(username);
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
			notification.find('.content').html('Account setting saved');
			$("html, body").animate({ scrollTop: 0 }, 300);

			// fadeon success notification after 10s
			setTimeout(function() {
				notification.fadeOut('slow');
			}, 10000);
		},

		showAddCardPopup: function() {
			this.ui.addCardPopup.modal('show');
		},

		addCard: function() {
			var self = this,
				isValid = this.model.isValid(true);

			if(isValid) {
				this.ui.saveCardBtn.attr("disabled","disabled");
				Stripe.card.createToken({
				  number: self.ui.cardNumb.val(),
				  cvc: self.ui.cvc.val(),
				  exp_month: self.ui.cardExpMon.val(),
				  exp_year: self.ui.cardExpYear.val(),
				  name: self.ui.cardName.val()
				}, function(status, response) {
					console.log(status, response);
					if (response && response.error) {
						// show error validation msg
						self.ui.errMsg.show();
						self.ui.saveCardBtn.removeAttr("disabled");
						switch (response.error.code) {
							case 'invalid_number':
								self.ui.errMsg.html('The card number is not a valid credit card number.');
								break;

							case 'incorrect_number':
								self.ui.errMsg.html('The card number is incorrect.');
								break;

							case 'invalid_expiry_month':
								self.ui.errMsg.html('The card\'s expiration month is invalid.');
								break;

							case 'invalid_expiry_year':
								self.ui.errMsg.html('The card\'s expiration year is invalid.');
								break;

							case 'invalid_cvc':
								self.ui.errMsg.html('The card\'s security code is invalid.');
								break;

							case 'expired_card':
								self.ui.errMsg.html('The card has expired.');
								break;

							case 'incorrect_cvc':
								self.ui.errMsg.html('The card\'s security code is incorrect.');
								break;

							case 'card_declined':
								self.ui.errMsg.html('The card was declined.');
								break;

							case 'missing':
								self.ui.errMsg.html('There is no card on a customer that is being charged.');
								break;

							case 'processing_error':
								self.ui.errMsg.html('An error occurred while processing the card.');
								break;

							case 'rate_limit':
								self.ui.errMsg.html('An error occurred due to requests hitting the API too quickly. Please let us know if you\'re consistently running into this error.');
								break;

							case 'incorrect_zip':
								self.ui.errMsg.html('The card\'s zip code failed validation.');
								break;

						}
					} else if (status === 200) {

						self.ui.errMsg.hide();
						var stripeToken = response.id,
								cardData = {
									authenticity_token: conf.token,
									stripeToken: stripeToken
								};
						// check patient stripe_customer_id
						if (!gon.patient.stripe_customer_id) {
							var data = {
								authenticity_token: conf.token
							};
							api.put(['/charges/createcustomer/', stripeToken, '.json'].join(''), data, function(err, res) {
								// self.addOneCard(cardData, response.card);
								self.ui.errMsg.hide();
								self.ListCardView.collection.add(response.card);
								self.ui.addCardPopup.modal('hide');
								self.addNewCardSuccess();

								// clear form
								self.ui.addCardPopup.find('input').val('');
								self.$('.chosen-container').find('span').text('');
								_.each(self.model.attributes, function(value, attr) {
									self.model.set(attr, '');
								});
								self.ui.saveCardBtn.removeAttr("disabled");
							});
						} else {
							self.addOneCard(cardData, response.card);
						}
					}
				});	
			}
		},

		addOneCard: function(data, model) {
			var self = this;
			api.put('/charges/addcard.json', data, function(err, res) {
				console.log(err, res);
				if (res && res.success === false) {
					self.ui.errMsg.show();
					self.ui.errMsg.html(res.message);
				} else if (res) {
					self.ui.errMsg.hide();
					self.ListCardView.collection.add(model);
					self.ui.addCardPopup.modal('hide');
					self.addNewCardSuccess();

					// clear form
					self.ui.addCardPopup.find('input').val('');
					self.$('.chosen-container').find('span').text('');
					_.each(self.model.attributes, function(value, attr) {
						self.model.set(attr, '');
					});
				}
				self.ui.saveCardBtn.removeAttr("disabled");
			});
		},

		addNewCardSuccess: function() {
			var notification = $('#sub-header-notification');
			notification.show();
			notification.addClass('themed-background-success').fadeIn('slow');
			notification.find('.content').html('New card was saved');
			$("html, body").animate({ scrollTop: 0 }, 300);

			// fadeon success notification after 10s
			setTimeout(function() {
				notification.fadeOut('slow');
			}, 10000);
		},
		
		onRender: function() {
			console.log('App.Render.AccountInfo');
			var self = this;
			var changeAffixWidth = function() {
				self.ui.affixMenu.css('width', self.ui.affixMenu.width() - 1);
			};
			changeAffixWidth();
			var checkAffixWidth= _.debounce(changeAffixWidth, 200);
			$(window).resize(function() {
				self.ui.affixMenu.removeAttr('style');
				checkAffixWidth();
			});
			this.ListCardView = new ListCard(gon.list_cards);

			// show active nav on sidebar
			// change href of current view
			// to implement scrolling behavior
			var navAccount = $('#nav-account');
			navAccount.addClass('active');
			navAccount.next().find('a').attr('href', 'javascript:void(0)');

		  // scroll to section
			var fragment = purl(window.href).attr('fragment');
			if (fragment !== '')
				setTimeout(function() {
			  	self.$el.find('.'+ fragment).click();
				}, 300);

			// initialize chosen
			this.ui.country.chosen({width: "100%"});
			this.ui.stateTxt.chosen({width: "100%"});
			this.ui.timezone.chosen({width: "100%"});

			// special initialize for patient
			this.ui.timezone.chosen({width: "100%"});
			if (gon.user.account_type.toLowerCase() === "patient") {
				this.ui.cardExpMon.chosen({width: "100%"});
				this.ui.cardExpYear.chosen({width: "100%"});
				//this.ui.cvc.mask("999");
			}

			this.ui.ssn.mask("999-99-9999");

			var value = this.ui.country.val(),
				mask = "999-999-9999";

			if(parseInt(value) == 233) {
				this.ui.phone.mask(mask);
			}else {
				this.ui.phone.unmask(mask);
				this.ui.phone.attr('placeholder', ' ');
			}
			
		
			//this.ui.phone.mask("999-999-9999");

			// initialize backbone stickit
			this.stickit();

			// initialize practice details backbone validation
			Backbone.Validation.bind(this, {
				selector: 'id'
			});

			// initialize account info backbone validation
			Backbone.Validation.bind(this, {
				selector: 'id',
				model: this.accModel
			});
			
			this.ui.affixMenu.affix({
		    offset: {
		      top: 160,
		      bottom: 200
		    }
		  });

			//append modal confirm
			$('body').append(this.modalConfirmDeleteCard.render().$el);

		  // implement bootstrap scrollspy
			$('body').scrollspy({ target: '.affix-menu-nav', offset: 150 });
		  var sidebar = $('#main-sidebar');
			$('body').on('activate.bs.scrollspy', function (e) {
				var sidebarActive = $(e.target).attr('target');
				sidebar.find('.account-scrollby-section a').removeClass('active');
				sidebar.find(sidebarActive).addClass('active');
			});


			if (gon.user.account_type === 'patient') {
				// get stripe pubic key
				api.get('/charges/getpublishablekey.json', function(err, res) {
					if (res) {
						Stripe.setPublishableKey(res.publishable_key);
					}
				});
			}
			if (gon.user.account_type.toLowerCase() === 'therapist') {
				this.ui.intakeTxt.wysihtml5();
			}
		}
	});

	return EditProfileView;
});