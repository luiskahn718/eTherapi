define([
	'hbs!templates/layout/header',
	'chosen'
], function(
	headerTpl
) {
	'use strict';

	var HeaderView = Backbone.Marionette.ItemView.extend({
		template: '#main-header',

		ui: {
			searchTxt: '#search-patient-txt'
		},

		events: {
			'change #search-patient-txt': 'onSearchPatient'
		},

		initialize: function(opts) {
			if (opts) {
				if(opts.user.account_type.toLowerCase() === 'therapist') {
					this.template = headerTpl;
					this.$el = $('.navbar-form');	
				}
				this.accountType = opts.user.account_type.toLowerCase();
				this.patientlist = opts.patientlist;
				this.render();
			}
		},

		serializeData: function(){
			return gon.user;
		},

		onSearchPatient: function() {
			var url = this.ui.searchTxt.val();
			window.location = url;
		},

		onRender: function() {
			// implemented search patient infor
			var listPatient = [],
				accountType = '';

			if(gon.user) {

				listPatient = this.sortPatientList(gon.patientlist);
				accountType = gon.user.account_type.toLowerCase();
				
			} else if (this.patientlist) {

				listPatient = this.sortPatientList(this.patientlist);
				accountType = this.accountType;
			}
			if (accountType === 'therapist') {
				var self = this;
				_.each(listPatient, function(item) {
					self.ui.searchTxt.append(['<option value="/therapist/patient/', item.patient_id, '">', item.first_name,' ', item.last_name, '</option>'].join(''));
				});
      	self.ui.searchTxt.chosen({width: "100%"});
	    }
		},

		sortPatientList: function(patientList) {
			var newList = _.sortBy(patientList, function(item) {
				return item.last_name
			});

			return newList;
		}
	});

	return HeaderView;
});