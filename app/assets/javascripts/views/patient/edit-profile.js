define([
	'hbs!templates/patient/edit-profile',
	'models/patient/profile',
	'models/patient/insurance-model',
	//views
	'views/patient/insurance/insurance-collection-view',
	'views/patient/insurance/confirm-delete-insurance-view',
	'views/patient/insurance/insurance-modal-view',
	'backbone-eventbroker',
	'stickit',
	'purl',
	'api',
	'conf',
	'crop',
	'chosen',
	'datepicker',
	'maskedInput'
], function(
	editprofileTpl,
	patientModel,
	InsuranceModel,
	InsuranceCollectionView,
	ConfirmModelView,
	InsuranceModalView,
	EventBroker,
	stickit,
	purl,
	api,
	conf
) {
	'use strict';

	var PatientEditProfile = Backbone.Marionette.ItemView.extend({
		template: editprofileTpl,
		el: '#patient-edit-profile-wrapper',

		ui: {
			uploadfile: '#uploadfile',
			cropContainer: '.crop-container',
			previewWrapper: '.photo-wrapper-crop',
			avatar: '#real-avt',
			uploadPhoto: '.original-upload-photo',
			saveBtn: '.save-patient-profile',
			phone: '#phone_home',
			ecPhone: '#emergency_contact_phone_no',
			dob: '#date_of_birth',
			affixMenu: '.affix-menu-nav',
			proPicSec: '#pt-pro-pic-section',
			infoSec: '#pt-contact-info-section',
			insuranceSec: '#pt-insurance-section',
			mh: '#pt-mh-section',
			country: '#country_cde',
			gender: '#gender'
		},

		events: {
			'change #uploadfile': 'loadImageFile',
			'click .change-avatar': 'showCropPopup',
			'click #del-avatar-btn': 'deleteAvatar',
			'click #save-crop-avt': 'saveCropAvatar',
			'click .save-patient-profile': 'saveProfile',
			'click .pt-pro-pic-section': 'scrollToProPic',
			'click .pt-contact-info-section': 'scrollToContactInfo',
			'click .pt-insurance-section': 'scrollToInsurance',
			'click .pt-mh-section': 'scrollToMH',
			'change #gender': 'changeDefaultAvatar'
			//'change #country_cde': 'changeSelectCountryCode'
		},

		bindings: {
			'#first_name': 'first_name',
			'#last_name': 'last_name',
			'#gender': 'gender',
			'#date_of_birth': 'date_of_birth',
			'#mail_address1': 'mail_address1',
			'#phone_home': 'phone_home',
			'#address1': 'address1',
			'#city': 'city',
			'#state_cde': 'state_cde',
			'#zipcode': 'zipcode',
			'#country_cde': 'country_cde',
			'#timezone': 'timezone',
			'#emergency_contact_name': 'emergency_contact_name',
			'#emergency_contact_phone_no': 'emergency_contact_phone_no',
			'#medical_history': 'medical_history'
		},

		initialize: function() {
			var self = this;
			this.headerHeight = 60;

			// this.patientProfile = {
			// 	patient: gon.patient
			// };
			this.mainModel = new patientModel();
			this.insuranceModel = new InsuranceModel();

			//new confirm modal delete insurance
			this.confirmModelView = new ConfirmModelView();

			// new modal add insurance
			this.insuranceModalView = new InsuranceModalView();

			// backbone events broker
			EventBroker.register({
				'proPicSec:scroll': 'scrollToProPic',
				'infoSec:scroll': 'scrollToContactInfo',
				'insuranceSec:scroll': 'scrollToInsurance',
				'mh:scroll': 'scrollToMH'
			},this);
			api.get('/patient/get_patient_info.json', function(err, res) {
				console.log(err, res);
				if (res) {
					self.patientProfile = res;
					self.patientProfile.patient.countryCode = res.country_cdes;
					self.patientProfile.patient.stateCode = res.state_cdes;
					self.patientProfile.patient.insurance = res.patient_insurances;
					self.model = new patientModel(self.patientProfile.patient);
					self.render();
				}
			});
		},

		serializeData: function() {
			console.log(this.patientProfile.patient);
			this.patientProfile.patient.currentTime = Date.parse(moment().format());

			return this.patientProfile.patient;
		},

		changeDefaultAvatar: function() {
			var femaleAvt = '/images/user-avatar/Avatar-Female120x120.png',
					maleAvt = '/images/user-avatar/Avatar-Male120x120.png',
					gender = this.ui.gender.val().trim(),
					currentAvt = this.ui.avatar.attr('src');
			if (currentAvt === femaleAvt || currentAvt === maleAvt) {
				if (gender === 'M')
					this.ui.avatar.attr('src', maleAvt);
				else
					this.ui.avatar.attr('src', femaleAvt);
			}



		},

		/*changeSelectCountryCode: function() {
			var value = this.model.get('country_cde'),
				mask = "999-999-9999";//this.ui.country.val();
			console.log('changeSelectCountryCode', value);
			if(value == '17') {
				this.ui.phone.mask(mask);
			}else {
				this.ui.phone.unmask(mask);
			}
		},*/

		scrollToProPic: function() {
			var top = this.ui.proPicSec.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToContactInfo: function() {
			var top = this.ui.infoSec.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToInsurance: function() {
			var top = this.ui.insuranceSec.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToMH: function() {
			var top = this.ui.mh.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		loadImageFile: function() {
			var self = this;
			var file = document.getElementById("uploadfile").files[0];
			var oFReader = new FileReader(), rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
			console.log(oFReader);
			if(!rFilter.test(file.type)) {
        return;
	    }
	    oFReader.readAsDataURL(file);
			oFReader.onload = function (oFREvent) {
				// load image into crop
				self.ui.uploadPhoto.html('<div class="default"><div class="cropMain"></div><div class="cropSlider"></div></div>');
				self.avatar = new CROP();
				self.avatar.init('.original-upload-photo');
				self.avatar.loadImg(oFREvent.target.result);

				// callback function when drag avatar
				self.avatar.moveCallback = function() {
					// grab width and height of .crop-img for canvas
					var cropContainer = $('.crop-container');
					var	width = cropContainer.width() - 80,  // new image width
						height = cropContainer.height() - 80;  // new image height

					self.ui.previewWrapper.html('');
					self.ui.previewWrapper.html('<canvas width="'+width+'" height="'+height+'" id="canvas"/>');

					var ctx = document.getElementById('canvas').getContext('2d'),
							img = new Image,
							w = coordinates(self.avatar).w,
						    h = coordinates(self.avatar).h,
						    x = coordinates(self.avatar).x,
						    y = coordinates(self.avatar).y;

					img.src = coordinates(self.avatar).image;
					img.onload = function() {
						// draw image
				    ctx.drawImage(img, x, y, w, h, 0, 0, width, height);
						self.base64Img = canvas.toDataURL("image/png");
					};
				};
			};
		},

		saveCropAvatar: function() {
			// update avatar image src attribute
			this.ui.avatar.attr('src', this.base64Img);
			$('#profile-upload-modal').modal('hide');
		},

		showCropPopup: function() {
			var self = this;
			if (!this.avatar) {
				var avatarUrl,
						realAvatar = self.patientProfile.patient.picture_filelink.url;
				if (realAvatar) {
					avatarUrl = realAvatar;
				} else {
					if (self.patientProfile.patient.gender === 'M')
						avatarUrl = '/images/user-avatar/Avatar-Male120x120.png';
					else
						avatarUrl = '/images/user-avatar/Avatar-Female120x120.png';
				}
				console.log(avatarUrl);
				this.avatar = new CROP();
				this.avatar.init('.original-upload-photo');
				this.avatar.loadImg(avatarUrl);

				// callback function when drag avatar
				this.avatar.moveCallback = function() {
					// grab width and height of .crop-img for canvas
					var cropContainer = $('.crop-container');
					var	width = cropContainer.width() - 70,  // new image width
							height = cropContainer.height() - 70;  // new image height

					self.ui.previewWrapper.html('');
					self.ui.previewWrapper.html('<canvas width="'+width+'" height="'+height+'" id="canvas"/>');

					var ctx = document.getElementById('canvas').getContext('2d'),
							img = new Image,
							w = coordinates(self.avatar).w,
					    h = coordinates(self.avatar).h,
					    x = coordinates(self.avatar).x,
					    y = coordinates(self.avatar).y;
					    console.log(w,h);

					img.src = coordinates(self.avatar).image;
					img.onload = function() {
						// draw image
				    ctx.drawImage(img, x, y, w, h, 0, 0, width, height);
						self.base64Img = canvas.toDataURL("image/png");
					};
				};
			}
		},

		deleteAvatar: function() {
			this.deletedAvatar = true;
			var self = this,
				patient = self.patientProfile.patient;
				
			if (patient.gender === 'M') {
				this.ui.avatar.attr('src', '/images/user-avatar/Avatar-Male120x120.png');
			} else {
				this.ui.avatar.attr('src', '/images/user-avatar/Avatar-Female120x120.png');
			}
		},

		saveProfile: function() {
			// validate value
			var self = this,
					isValid = this.model.isValid(true);
			if (isValid) {
				// reformat date
				var dateOfBirth = this.model.get('date_of_birth');
				if (dateOfBirth) {
					dateOfBirth = dateOfBirth.split('/');
					dateOfBirth = [dateOfBirth[2], dateOfBirth[0], dateOfBirth[1]].join('/');
				}
				

				console.log('this.patientProfile.patient.insurance', this.patientProfile.patient.insurance);
				

				this.mainModel.set('patient', this.model.attributes);


				this.mainModel.attributes.patient.date_of_birth = dateOfBirth;
				
				// save avatar base64
				var base64Avatar = this.ui.avatar.attr('src');
				if (base64Avatar.substring(0,10) === 'data:image') {
					base64Avatar = base64Avatar.split('data:image/png;base64,');
					var avatar = {
						authenticity_token: conf.token,
						picture: base64Avatar[1]
					}
					api.post('/patient/save_avatar.json', avatar, function(err, res) {
						console.log(err, res);

					});
				}

				// remove avatar from profile infor
				// set null for avatar value
				if (this.deletedAvatar) {
					var removeAvatar = {
						authenticity_token: conf.token
					};
					api.put('/patient/remove_avatar.json', removeAvatar, function(err, res) {
						console.log(err, res);
					});

					this.patientProfile.patient.picture_filelink.url = null;
					this.patientProfile.patient.picture_filelink.thumb.url = null;
					this.patientProfile.patient.thumbnail_filelink = null;
				}

				this.mainModel.sync("update", this.mainModel, {
					success: function(res) {
						console.log('Saved success', res);
						this.deletedAvatar = false;
						//res.patient.picture_filelink;
						//res.patient.gender;
						if(!res.patient.picture_filelink.url && !self.avatar) {
							if(res.patient.gender === 'M') {
								self.ui.avatar.attr('src', '/images/user-avatar/Avatar-Male120x120.png');
							} else {
								self.ui.avatar.attr('src', '/images/user-avatar/Avatar-Female120x120.png');
							}
						}
						$('#sidebar-avatar').attr('src', self.ui.avatar.attr('src'));
						self.successSavedSetting();

					}
				});
			} else {
				var top = this.$('.has-error').offset().top - this.headerHeight;
				$("html, body").animate({ scrollTop: top }, 300);
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
			console.log('App.Render: Patient edit profile');
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


			// show active nav on sidebar
			// change href of current view
			// to implement scrolling behavior
			var navProfile = $('#nav-profile');
			navProfile.addClass('active');
			navProfile.next().find('a').attr('href', 'javascript:void(0)');

		  // scroll to section
			var fragment = purl(window.href).attr('fragment');
			if (fragment !== '')
				setTimeout(function() {
			  	self.$el.find('.'+ fragment).click();
				}, 300);

      this.$el.find('.select-chosen').chosen({width: "100%"});

			this.ui.ecPhone.mask("999-999-9999");

			//var value = this.ui.country.val();
			
	
			this.ui.phone.mask("999-999-9999");
		

			// initialize backbone stickit
			this.stickit();

			// initialize practice details backbone validation
			Backbone.Validation.bind(this, {
				selector: 'id'
			});
			
			this.ui.affixMenu.affix({
		    offset: {
		      top: 150,
		      bottom: 200
		    }
		  });

		  // implement bootstrap scrollspy
			$('body').scrollspy({ target: '.affix-menu-nav', offset: 170 });
		  var sidebar = $('#main-sidebar');
			$('body').on('activate.bs.scrollspy', function (e) {
				var sidebarActive = $(e.target).attr('target');
				sidebar.find('.profile-scrollpy-section a').removeClass('active');
				sidebar.find(sidebarActive).addClass('active');
			});

      // Initialize Datepicker
      this.ui.dob.datepicker({weekStart: 1});
      // reformat date
      var date = this.patientProfile.patient.date_of_birth;
      if (date) {
	      date = date.split('-');
	      date = [date[1], date[2], date[0]].join('-');
      }
      this.ui.dob.datepicker("update", date );

      //new insurance collection view
      this.insuranceCollectionView = new InsuranceCollectionView(this.patientProfile.patient.insurance);
      console.log('this.patientProfile.patient.insurance', this.patientProfile.patient.insurance);

      //append confirm modal
      $('body').append(this.confirmModelView.render().$el);

      //append insurance modal view
      $('body').append(this.insuranceModalView.render().$el);
		}
	});

	return PatientEditProfile;

});