define([
	'hbs!templates/therapist/edit-profile',
	'models/profile/profile',
	'views/profile/license-view',
	'views/profile/professional-association-view',
	'views/profile/school-degree-view',
	'purl',
	'backbone-eventbroker',
	'api',
	'moment',
	'conf',
	'typeahead',
	'crop',
	'chosen',
	'datepicker',
	// 'bootstrap-wysihtml5',
	'tags-input'
], function(
	editProfileTpl,
	profileModel,
	LicenseView,
	ProAssociationView,
	SchoolDegressView,
	purl,
	EventBroker,
	api,
	moment,
	conf
) {
	'use strict';
	var EditProfileView = Backbone.Marionette.ItemView.extend({
		template: editProfileTpl,
		el: '.edit-therapist-profile',

		ui: {
			uploadfile: '#uploadfile',
			cropContainer: '.crop-container',
			previewWrapper: '.photo-wrapper-crop',
			avatar: '#real-avt',
			uploadPhoto: '.original-upload-photo',
			licenseList: '.license-list-data',
			schoolList: '.school-list-data',
			professionalAssList: '.professional-list-data',
			treatmentTxt: '#treatment-txt',
			demographicsTxt: '#demographics-txt',
			specialityTxt: '#speciality-txt',
			additionalTxt: '#additional-txt',
			languageTxt: '#language-spoken-txt',
			insuranceTxt: '#insurance-txt',
			aboutMe: '#about-me-txt',
			youtubeUrl: '#youtube-url',
			exp: '#experience-chosen',
			cancelCb: '#cancel-cb',
			affixMenu: '.affix-menu-nav',
			profilePicSection: '#profile-pic-section',
			aboutSection: '#about-section',
			financesSection: '#finances-section',
			specialtiesSection: '#specialties-section',
			credentialsSection: '#credentials-section',
			slidingScale: '#sliding-scale-cb',
			duration: '#duration-chosen',
			pricingTxt: '#pricing-txt',
			specialtiesRow: '.specialties',
			additionRow: '.additional-expertise',
			languageRow: '.language-spoken',
			insuranceRow: '.insurance-plan',
			viewProfile: '.view-profile-btn',
			speciality: '.speciality',
			selectLicense: '.select-license'
		},

		events: {
			'change #uploadfile': 'loadImageFile',
			'click .change-avatar': 'showCropPopup',
			'click #save-crop-avt': 'saveCropAvatar',
			'click #add-license': 'addNewLicenseRow',
			'click #add-school': 'addNewSchool',
			'click #add-professional-asscociation': 'addNewProfessionalAssociation',
			'click .save-edit-profile': 'saveProfileInfor',
			'click #del-avatar-btn': 'deleteAvatar',
			'click .profile-pic-nav': 'scrollProfilePic',
			'click .about-nav': 'scrollToAbout',
			'click .finances-nav': 'scrollToFinances',
			'click .specialties-nav': 'scrollToSpecialties',
			'click .credentials-nav': 'scrollToCredentials',
			'click .tagsinput': 'focusOnTextInput',
			'click .view-profile-btn': 'viewProfile'
		},

		initialize: function() {
			this.isSaveProfile = false;
			var self = this,
					userInfo,
					id = null;
			this.specialityCode = [];
			this.demographicsServedCode = [];
			this.treatmentApproachCode = [];
			this.stateLicenseCode = [];
			_.each(gon.speciality_cdes, function(item) {
				self.specialityCode.push(item.name);
			});
			_.each(gon.demographics_served_cdes, function(item) {
				self.demographicsServedCode.push(item.name);
			});
			_.each(gon.treatment_approach_cdes, function(item) {
				self.treatmentApproachCode.push(item.description);
			});
			_.each(gon.state_license_cdes, function(item) {
				self.stateLicenseCode.push(item.license_abbreviation);
			});

			this.headerHeight = 60;

			// backbone events broker
			EventBroker.register({
				'profile-pic-form:scroll': 'scrollProfilePic',
				'about-form:scroll': 'scrollToAbout',
				'finances-form:scroll': 'scrollToFinances',
				'specialties-form:scroll': 'scrollToSpecialties',
				'credentials-form:scroll': 'scrollToCredentials'
			},this);

			api.get('/therapist/get_relate_info.json', function(err, res) {
				if (res) {
					userInfo = res;
					var addtionalArr = [],
							specialityArr = [];
					console.log(userInfo.therapist_speciality);
					_.each(userInfo.therapist_speciality, function(item) {
						if (item.seq_speciality_cde === 9) {
							addtionalArr.push(item);
						} else {
							specialityArr.push(item);
						}

					});
					console.log(specialityArr, addtionalArr);
					if (userInfo.therapist_profile) {
						id = userInfo.therapist_profile.therapist_id;
					}
					// initilize profile data based on gon
					self.profileInfor = {
						therapist: {
							therapist_id: gon.therapist.therapist_id,
							gender: userInfo.therapist.gender,
							picture_filelink: userInfo.therapist.picture_filelink,
							session_duration: userInfo.therapist.session_duration,
							therapist_profile_attributes: {
								id: id,
								about_me: userInfo.therapist_profile ? userInfo.therapist_profile.about_me : '',
								education: userInfo.therapist_profile ? userInfo.therapist_profile.education : '',
								prof_memberships: userInfo.therapist_profile ? userInfo.therapist_profile.prof_memberships : '',
								experience_years: userInfo.therapist_profile ? userInfo.therapist_profile.experience_years : '',
								treatment_approach: userInfo.therapist_profile ? userInfo.therapist_profile.treatment_approach : '',
								demographics_served: userInfo.therapist_profile ? userInfo.therapist_profile.demographics_served : '',
								youtube_link: userInfo.therapist_profile ? userInfo.therapist_profile.youtube_link : '',
								charge_for_cancellation: userInfo.therapist_profile ? userInfo.therapist_profile.charge_for_cancellation : false,
								// additional_expertise: self.userInfo.therapist_profile ? self.userInfo.therapist_profile.additional_expertise : '',
								sliding_scale: userInfo.therapist_profile ? userInfo.therapist_profile.sliding_scale: '',
								hourly_rate_max: userInfo.therapist_profile ? userInfo.therapist_profile.hourly_rate_max: '',

							},
							therapist_language_attributes: userInfo.therapist_language,
							therapist_license_attributes: userInfo.therapist_license,
							therapist_speciality_attributes: userInfo.therapist_speciality,
							therapist_accept_insurance_attributes: userInfo.therapist_accept_insurance,

							therapist_user_profile: userInfo.therapist,

							speciality: gon.speciality_cdes,
							language_cdes: gon.language_cdes,
							insurance_payers_name: gon.insurance_payers_name,
							addtionalArr: addtionalArr,
							specialityArr: specialityArr
						}

					}
					console.log(self.profileInfor);
					// var addition = self.sliceStringAdditionalExpertise();
					// self.profileInfor.therapist.additional = addition;

					console.log('addition', self.profileInfor.therapist.therapist_profile_attributes.additional_expertise);

					self.model = new profileModel(self.profileInfor);
					self.render();
				}
			});
		},

		serializeData: function() {
			this.profileInfor.therapist.currentTime = Date.parse(moment().format());
			return this.profileInfor.therapist;
		},

		viewProfile: function() {
			console.log('viewProfile');
			if(!this.isSaveProfile) {
				this.saveProfileInfor(true);
			} else {
				this.ui.viewProfile.attr('href', '/therapist/' + this.profileInfor.therapist.therapist_profile_attributes.id + '/profile');
			}
		},

		scrollProfilePic: function() {
			var top = this.ui.profilePicSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToAbout: function() {
			var top = this.ui.aboutSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToFinances: function() {
			var top = this.ui.financesSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToSpecialties: function() {
			var top = this.ui.specialtiesSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		scrollToCredentials: function() {
			var top = this.ui.credentialsSection.offset().top - this.headerHeight;
			$("html, body").animate({ scrollTop: top }, 300);
		},

		focusOnTextInput: function(e) {
			var target = $(e.target);
			target.find('.bootstrap-tagsinput input').focus();
		},

		addNewLicenseRow: function() {
			this.license.addNew();
		},

		addNewSchool: function() {
			this.schoolDegree.addNew();
		},

		addNewProfessionalAssociation: function() {
			this.proAssociation.addNew();
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
						realAvatar = self.profileInfor.therapist.picture_filelink.url;
				if (realAvatar) {
					avatarUrl = realAvatar;
				} else {
					if (self.profileInfor.therapist.gender === 'M')
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

		updateTagsInputData: function(newVal, currentVal, dataName, checkAdditional) {
			var len = currentVal.length,
					i = 0;
			if (_.isString(newVal))
				newVal = newVal.split(',');

			console.log(newVal, currentVal);
			_.each(currentVal, function(val) {
				val._destroy = true;
				if (dataName === 'contract_ref_no') {
					val.id = val.insurance_id;
				}
			});
			_.each(newVal, function(val) {
				var item = {
					_destroy: false
				};
				if (dataName === 'language_cde') {
					val = val.split('--');
					item['therapist_id'] = gon.therapist.therapist_id;
					item['proficiency'] = 'good';
					item[dataName] = val[1];
				} else if (dataName === 'seq_speciality_cde') {
					val = val.split('-');
					if (checkAdditional === 'additional') {
						item[dataName] = 9;
					} else {
						item[dataName] = 0;
					}
					item['therapist_id'] = gon.therapist.therapist_id;
					item['speciality_id'] = Number(val[1]);
					item['name'] = val[0];
				} else if (dataName === 'contract_ref_no') {
					// re-format data to send to server
					var date = moment().format('L');
					date = date.split('/');
					date = [date[2], date[0], date[1]].join('/');

					val = val.split('--');
					console.log(val);
					item['start_date'] = date;
					item['insurance_payer_id'] = Number(val[1]);
					// item['id'] = Number(val[1]);
					item['entity_id'] = gon.therapist.therapist_id;
				} else {
					item['therapist_id'] = gon.therapist.therapist_id;
					item[dataName] = val;
				}
				currentVal.push(item);
			});
			console.log(currentVal);
			return currentVal;
		},

		deleteAvatar: function() {
			this.deletedAvatar = true;
			var self = this;
				therapist = self.profileInfor.therapist;

			if (therapist.gender === 'M') {
				this.ui.avatar.attr('src', '/images/user-avatar/Avatar-Male120x120.png');
			} else {
				this.ui.avatar.attr('src', '/images/user-avatar/Avatar-Female120x120.png');
			}
		},

		saveProfileInfor: function(isViewProfile) {
			console.log('Save edit profile');
			var self = this,
					pricing = this.ui.pricingTxt.val().trim(),
					pricingWrapper = this.ui.pricingTxt.closest('.cash'),
					youtubeUrl = this.ui.youtubeUrl.val().trim(),
					videoWrapper = this.ui.youtubeUrl.closest('.introduction-video'),
					licenseType = this.$('.select-license'),
					licenseNumber = this.$('.license-number'),
					selectDate = this.$('.seclect-date'),
					selectState = this.$('.state-group');

			var isNotSelectLicense = this.checkValueLicense(licenseType),
					isNotEnterNumber = this.checkValueLicense(licenseNumber),
					isNotSelectDate = this.checkValueLicense(selectDate),
					isNotSelectState = this.checkValueLicense(selectState);

			if (isNotSelectState || isNotSelectLicense || isNotEnterNumber || isNotSelectDate) return;

			if (youtubeUrl.match(/(youtu.be\/|youtube.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&\"\'>]+)/) || !youtubeUrl || youtubeUrl === '') {
				videoWrapper.removeClass('has-error');
				if (pricing ==='' || !pricing || pricing.match('^[0-9]+$')) {
					pricingWrapper.removeClass('has-error');
					var language = this.updateTagsInputData(this.ui.languageTxt.val(), self.profileInfor.therapist.therapist_language_attributes, 'language_cde'),
							insurance = this.updateTagsInputData(this.ui.insuranceTxt.val(), self.profileInfor.therapist.therapist_accept_insurance_attributes, 'contract_ref_no'),
							speciality = this.updateTagsInputData(this.ui.specialityTxt.val(), self.profileInfor.therapist.specialityArr, 'seq_speciality_cde'),
							additional = this.updateTagsInputData(this.ui.additionalTxt.val(), self.profileInfor.therapist.addtionalArr, 'seq_speciality_cde', 'additional'),
							schoolDegreeVal = this.schoolDegree.collection.toJSON(),
							proAssociationVal = this.proAssociation.collection.toJSON(),
							schoolDegree = [],
							proAssociation = [],
							cancelCb = 0,
							slicingCb = 'N';

					// update schoolDegree data based on backend data format
					_.each(schoolDegreeVal, function(school) {
						schoolDegree.push(school.value);
					});
					schoolDegree = schoolDegree.join(',');

					// update proAssociation data based on backend data format
					_.each(proAssociationVal, function(prof) {
						proAssociation.push(prof.value);
					});
					proAssociation = proAssociation.join(',');

					// update charge_cancellation data based on backend data format (1 or 0)
					if (this.ui.cancelCb.is(':checked'))
						cancelCb = 1;
					if (this.ui.slidingScale.is(':checked'))
						slicingCb = 'Y';

					// var addition = this.ui.additionalTxt.val();
					// if (addition && addition !== '') {
					// 	addition = addition.join(',');
					// }
					console.log(this.license.collection.toJSON());
					var therapist_speciality_attributes = additional.concat(speciality);
					console.log(therapist_speciality_attributes);


					// speciality = speciality.push(addition);
					console.log(speciality,additional);

					this.profileInfor = {
						therapist: {
							gender: self.profileInfor.therapist.gender,
							picture_filelink: self.profileInfor.therapist.picture_filelink,
							session_duration: Number(this.ui.duration.val()),
							therapist_profile_attributes: {
								id: this.profileInfor.therapist.therapist_profile_attributes.id,
								about_me: this.ui.aboutMe.val().trim(),
								education: schoolDegree,
								prof_memberships: proAssociation,
								experience_years: this.ui.exp.val(),
								treatment_approach: this.ui.treatmentTxt.val(),
								demographics_served: this.ui.demographicsTxt.val(),
								youtube_link: this.ui.youtubeUrl.val().trim(),
								charge_for_cancellation: cancelCb,
								// additional_expertise: addition,
								sliding_scale: slicingCb,
								hourly_rate_max: this.ui.pricingTxt.val(),
							},
							therapist_language_attributes: language,
							therapist_license_attributes: this.license.collection.toJSON(),
							therapist_speciality_attributes: therapist_speciality_attributes,
							therapist_accept_insurance_attributes: insurance
						}

					};
					// save avatar base64
					var base64Avatar = this.ui.avatar.attr('src');
					if (base64Avatar.substring(0,10) === 'data:image') {
						base64Avatar = base64Avatar.split('data:image/png;base64,');
						var avatar = {
							authenticity_token: conf.token,
							picture: base64Avatar[1]
						}
						api.post('/therapist/save_avatar.json', avatar, function(err, res) {
							console.log(err, res);
						});
					}

					// remove avatar from profile infor
					// set null for avatar value
					if (this.deletedAvatar) {
						var removeAvatar = {
							authenticity_token: conf.token
						};
						api.put('/therapist/remove_avatar.json', removeAvatar, function(err, res) {
							console.log(err, res);
						});

						this.profileInfor.therapist.picture_filelink.url = null;
						this.profileInfor.therapist.picture_filelink.thumb.url = null;
						this.profileInfor.therapist.thumbnail_filelink = null;
					}
					var licenseList = this.profileInfor.therapist.therapist_license_attributes;

					if(this.model.get('therapist').therapist_license) {
						console.log('model therapist', this.model.get('therapist').therapist_license);
						this.profileInfor.therapist.therapist_license_attributes = this.model.get('therapist').therapist_license;
					}
		
					this.model.set('therapist', this.profileInfor.therapist);
					this.model.sync('update',this.model, {
						success: function(res) {
							console.log(res);
							self.isSaveProfile = true;
							self.profileInfor.therapist.therapist_language_attributes = res.therapist_language;
							self.profileInfor.therapist.therapist_speciality_attributes = res.therapist_speciality;
							self.profileInfor.therapist.therapist_accept_insurance_attributes = res.therapist_accept_insurance;
							self.profileInfor.therapist.therapist_profile_attributes.id = res.therapist_profile.therapist_id;
							self.profileInfor.therapist.therapist_license = res.therapist_license;
							self.model.set('therapist', self.profileInfor.therapist);
							$('#sidebar-avatar').attr('src', self.ui.avatar.attr('src'));
							self.deletedAvatar = false;
							self.successSavedSetting();
							self.profileInfor.therapist.addtionalArr = [];
							self.profileInfor.therapist.specialityArr = [];
							_.each(self.profileInfor.therapist.therapist_speciality_attributes, function(item) {
								if (item.seq_speciality_cde === 9) {
									self.profileInfor.therapist.addtionalArr.push(item);
								} else {
									self.profileInfor.therapist.specialityArr.push(item);
								}

							});
							if(isViewProfile === true) {
								//self.ui.viewProfile.attr('href', )
								window.location = '/therapist/' + self.profileInfor.therapist.therapist_profile_attributes.id + '/profile';
							}
						}
					});
				} else {
					var top = this.ui.pricingTxt.offset().top - 60;
					$("body, html").animate({ scrollTop: top }, 300);
					pricingWrapper.addClass('has-error');
				}
			} else {
				var videoTop = videoWrapper.offset().top - 60;
				$("body, html").animate({ scrollTop: videoTop }, 300);
				videoWrapper.addClass('has-error');
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
			console.log('App.Render.TherapistEditProfile');
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

			// Initialize Chosen
      this.$el.find('.select-chosen').chosen({width: "100%"});

      // Initialize Datepicker
      this.$el.find('.input-datepicker, .input-daterange').datepicker({weekStart: 1});

			// update data format based on backend data structure
			var profile = this.profileInfor.therapist.therapist_profile_attributes,
					schoolDegreeVal = profile.education ? profile.education.split(',') : '',
					proAssociationVal = profile.prof_memberships ? profile.prof_memberships.split(',') : '';

			this.license = new LicenseView(this.profileInfor.therapist.therapist_license_attributes);
			this.proAssociation = new ProAssociationView(proAssociationVal);
			this.schoolDegree = new SchoolDegressView(schoolDegreeVal);
			if (this.license.collection.length === 0)
				this.addNewLicenseRow();
			if (this.proAssociation.collection.length === 0)
				this.addNewProfessionalAssociation();
			if (this.schoolDegree.collection.length === 0)
				this.addNewSchool();

			// Initialize Chosen
      this.ui.specialityTxt.chosen({width: "100%", max_selected_options: 3}).change(function(e, res) {
      	console.log(e, res);
      	var changeVal;
      	if (res.selected) {
      		changeVal = res.selected;
      	} else {
      		changeVal = res.deselected;
      	}
    		_.each(self.ui.additionalTxt.find('option'), function(item) {
    			var selectVal = $(item).val();
    			if (selectVal === changeVal) {
    				if (res.selected)
    					$(item).hide();
    				else
    					$(item).show();
						self.ui.additionalTxt.trigger("chosen:updated");
    			}
    		});

      });
      this.ui.additionalTxt.chosen({width: "100%"}).change(function(e, res) {
      	console.log(e, res);
      	var changeVal;
      	if (res.selected) {
      		changeVal = res.selected;
      	} else {
      		changeVal = res.deselected;
      	}
    		_.each(self.ui.specialityTxt.find('option'), function(item) {
    			var selectVal = $(item).val();
    			if (selectVal === changeVal) {
    				if (res.selected)
    					$(item).hide();
    				else
    					$(item).show();
						self.ui.specialityTxt.trigger("chosen:updated");
    			}
    		});

      });
      this.ui.languageTxt.chosen({width: "100%"});
      this.ui.insuranceTxt.chosen({width: "100%"});

      // check speciality

      var searchField = this.ui.speciality.find('.search-field');

      if(self.profileInfor.therapist.specialityArr.length === 3) {
      	this.ui.specialityTxt.removeAttr('data-placeholder');
      	searchField.hide();
      } else {
      	searchField.show();
      }

      // listent change 
      this.ui.specialityTxt.on('change', function(evt, params) {

		    if(self.ui.specialityTxt.find('option:selected').length === 3) {
    				searchField.hide();
		    } else {
		    	searchField.show();
		    }
			});

      this.ui.specialtiesRow.find('.search-field input').attr('placeholder', 'Select');
      this.ui.languageRow.find('.search-field input').attr('placeholder', 'Select');
      this.ui.additionRow.find('.search-field input').attr('placeholder', 'Select');
      this.ui.insuranceRow.find('.search-field input').attr('placeholder', 'Add Insurance');

      // Initialize Editor
      this.ui.aboutMe.wysihtml5();
      var bio = this.ui.aboutMe.data('wysihtml5');
      bio.editor.setValue(profile.about_me);

      // tagsinput for treatment-approach
      this.ui.treatmentTxt.tagsinput({
      	typeahead: {
			    source: self.treatmentApproachCode
			  }
      });

      // tagsinput for demographics-served
      this.ui.demographicsTxt.tagsinput({
      	typeahead: {
			    source: self.demographicsServedCode
			  }
      });

      console.log(this.model);
			
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

			// initialize auto complete search
			/*this.ui.treatmentTxt.parent().find('.bootstrap-tagsinput > input').typeahead({
				source: self.treatmentApproachCode,
        items: 20
			});*/
			/*this.ui.demographicsTxt.parent().find('.bootstrap-tagsinput > input').typeahead({
				source: self.demographicsServedCode,
        items: 20
			});*/
		},

		checkValueLicense: function(elements) {
			var isNotSelect = false;

			/*_.each(elements, function(item) {
				if(!$(item).val()) {
					isNotSelect = true;
					console.log('isNotSelect');
					$(item).parent().parent().addClass('has-error');
					var top = $(item).parent().offset().top - 60;

					$("body, html").animate({ scrollTop: top }, 300);

					return;

				} else {

					$(item).parent().parent().removeClass('has-error');
				}

			});*/
			_.each(elements, function (item) {
				if($(item).hasClass('has-error')) {
					isNotSelect = true;
					var top = $(item).offset().top - 60;

					$("body, html").animate({ scrollTop: top }, 300);
				}
			});

			if(isNotSelect) {
				return true;
			} else {
				return false;
			}
		}

		// sliceStringAdditionalExpertise: function() {
		// 	var newArr = [];

		// 	if (this.profileInfor.therapist.therapist_profile) {

		// 		var additionalExpertise = this.profileInfor.therapist.therapist_profile.additional_expertise;

		// 		if (additionalExpertise) {
		// 			var array = additionalExpertise.split(',');

		// 			_.each(array, function (item) {
		// 				var idx = item.indexOf('-'),
		// 						stringName = item.slice(0, idx),
		// 						id = item.slice(idx + 1);

		// 				var obj = {
		// 						name: stringName,
		// 						speciality_id: parseInt(id)
		// 					};
		// 				newArr.push(obj);
		// 			});
		// 		}

		// 		console.log('newArr', newArr);
		// 	}
		// 	return newArr;
		// }
	});

	return EditProfileView;
});