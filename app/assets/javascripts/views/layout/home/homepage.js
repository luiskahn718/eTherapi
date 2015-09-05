define([
	'hbs!templates/layout/home/homepage',
	'chosen',
	'bundle',
	'aniHeader',
	'parallax',
	'localscroll',
	'scrollTo'
], function (
	homeTpl,
	chosen,
	bundle
) {
	'use strict';

	var Homepage = Backbone.Marionette.ItemView.extend({
		template: homeTpl,

		el: '#main-homepage-wrapper',

		ui: {
			specialty: '#speciality-txt',
			provider: '#provider-txt',
			payment: '#payment-txt',
			state: '#state-txt',
			name: '#name-txt',
			gotoSearch: '#goto-search-btn'
		},

		events: {
			'change .search-therapist-input': 'onSearchTherapist',
			'keyup #name-txt': 'onSearchTherapist',
			'keyup #state-txt': 'onKeypressStateZip',
			'paste #state-txt': 'onKeypressStateZip',
			'cut #state-txt': 'onKeypressStateZip',
			'click .sign-up-btn': 'onShowSignUpModal'
		},

		initialize: function() {
			var self = this;
			this.render();
		},

		serializeData: function() {
			this.searchDefaultValue = {
				insurance_companies: gon.insurance_payers_names,
				speciality_cdes: gon.speciality_cdes,
				license_type_cdes: gon.license_type_cdes,
				state_cdes: gon.state_cdes,
			};

			return this.searchDefaultValue;
		},

		onKeypressStateZip: function(e) {
			var val = this.ui.state.val().trim(),
					len = val.length,
					keyCode = e.keyCode;

			if ((len > 4 || len === 0 ) && keyCode !== 13 && keyCode !== 9&& keyCode !== 38 && keyCode !== 40) {
				this.stateZip = '';
				this.zipcode = val;
				this.onSearchTherapist();
			}
		},

		onShowSignUpModal:function() {
			console.log('onShowSignUpModal');
			$('#signup-modal').modal('show');
		},
		
		onSearchTherapist: function() {
			var name = this.ui.name.val().trim(),
					speciality = this.ui.specialty.val().trim(),
					therapist_type = this.ui.provider.val().trim(),
					payment_type = this.ui.payment.val().trim(),
					state = this.stateZip,
					zipcode = this.zipcode;

			this.urlParam = {
				speciality: speciality,
				therapist_type: therapist_type,
				payment_type: payment_type,
				state: state,
				zipcode: zipcode,
				name: name,
				page: 1
			};

			this.ui.gotoSearch.attr('href', ['/therapist/searchresult', $.param(this.urlParam)].join('?'));
		},

		onRender: function() {
			console.log('App.Render: Home Page View');
			var self = this,
					states = new Bloodhound({
	        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
	        queryTokenizer: Bloodhound.tokenizers.whitespace,
	        local: gon.state_cdes
	    });

	    states.initialize();
	    console.log(states);

	    self.ui.state.typeahead({
		    	hint: true,
	  			highlight: true,
	  			minLength: 1
        }, {
        name: 'states',
        displayKey: 'name',
        source: states.ttAdapter()
	    }).on('typeahead:autocompleted', function(event, data){
	    	console.log(data.abbreviation);
	    	self.stateZip = data.state_id;
	    	self.onSearchTherapist();      
	    }).on('typeahead:selected', function(event, data){
	    	console.log(data.abbreviation);
	    	self.stateZip = data.state_id;
	    	self.onSearchTherapist();      
	    }).on('typeahead:cursorchanged', function(event, data){
	    	console.log(data.abbreviation);
	    	self.stateZip = data.state_id;
	    	self.onSearchTherapist();      
	    });

			// initialize chosen plugin
      this.ui.specialty.chosen({width: "100%"});
      this.ui.provider.chosen({width: "100%"});
      this.ui.payment.chosen({width: "100%"});

      
      $('#nav').localScroll(600);
      $('#banner').parallax("50%", .5);
      $('.testimonial-wrapper').parallax("50%", .2);
      $('.shot-wrapper').parallax("50%", .3);
			if (gon.user && gon.user.user_id)
        $('.sign-up-btn').css('visibility', 'hidden');
      // this.ui.state.chosen({width: "100%"});
		}
	});

	return Homepage;
});