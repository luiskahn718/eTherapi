define([
	'hbs!templates/profile/license',
	'chosen'
], function (licenseTpl) {
	'use strict';

	var LicenseView = Backbone.Marionette.ItemView.extend({
		template: licenseTpl,
		className: 'striped-row',

		ui: {
			numb: '.license-num',
			state: '.state-chosen',
			type: '.license-type-chosen',
			expiration: '.expiration-time'
		},

		events: {
			'keyup .license-num': 'updateLicenseNum',
			'change .state-chosen': 'updateState',
			'change .license-type-chosen': 'updateLicenType',
			'change .expiration-time': 'updateTime',
			'click .del-btn': 'removeRow'
		},

		initialize: function() {
			this.model.set('license_type_cdes', gon.license_type_cdes);
			this.model.set('state_cdes', gon.state_cdes);
		},

		updateState: function() {
			this.saveLicense();
			this.ui.state.closest('.form-group').removeClass('has-error');
		},

		updateLicenType: function() {
			this.saveLicense();
			this.ui.type.closest('.form-group').removeClass('has-error');
		},

		updateTime: function() {
			this.saveLicense();
			this.ui.expiration.closest('.form-group').removeClass('has-error');
		},

		saveLicense: function() {
			var numb = this.ui.numb.val().trim(),
					state = this.ui.state.val().trim(),
					type = this.ui.type.val().trim(),
					expiration = this.ui.expiration.val().trim();

			if (numb && state && type && expiration) {
				expiration = expiration.split('/');
				expiration = [expiration[2], expiration[0], expiration[1]].join('/');
				
				this.model.set('license_number', numb);
				this.model.set('state', state);
				this.model.set('license_type', type);
				this.model.set('end_date', expiration);
			}
		},

		updateLicenseNum: function() {
			var numb = this.ui.numb.val().trim(),
					numbWrapper = this.ui.numb.closest('.form-group');

			if (numb.match('^[0-9]+$')) {
				numbWrapper.removeClass('has-error');
				this.saveLicense();
			} else {
				numbWrapper.addClass('has-error');
			}
		},

		removeRow: function() {
			this.model.set('_destroy', true);
			this.$el.hide();
		},

		onRender: function() {
			// Initialize Chosen
      this.$el.find('.select-chosen').chosen({width: "100%"});

      // Initialize Datepicker
      this.ui.expiration.datepicker({weekStart: 1});

      // reformat date
      var date = this.model.get('end_date');
      if (date) {
      	date = date.split('-');
	      date = [date[1], date[2], date[0]].join('-');
	      this.ui.expiration.datepicker("update", date );
      }
		}

	});

	return LicenseView;
});