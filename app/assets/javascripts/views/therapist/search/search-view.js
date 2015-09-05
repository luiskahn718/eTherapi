define([
	'hbs!templates/therapist/search/search-view',
	'views/therapist/search/search-collection',
	'chosen',
	'bundle',
	'purl',
	'api'
], function (
	searchViewTpl,
	SearchResult,
	chosen,
	bundle,
	purl,
	api
) {
	'use strict';

	var search;

	var SearchTherapist = Backbone.Marionette.ItemView.extend({
		template: searchViewTpl,

		el: '#search-therapist-wrapper',

		ui: {
			specialty: '#speciality-txt',
			provider: '#provider-txt',
			payment: '#payment-txt',
			state: '#state-txt',
			name: '#name-txt',
			listResult: '#search-therapist-list'
		},

		events: {
			'change .search-therapist-input': 'onSearchTherapist',
			// 'keyup #name-txt': 'onSearchTherapist',
			// 'keyup #state-txt': 'onKeypressStateZip',
			'paste #state-txt': 'onKeypressStateZip',
			'cut #state-txt': 'onKeypressStateZip'
		},

		initialize: function() {
			var self = this;
			self.urlParam = {};
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
			var self;
			if (!this.ui) {
				self = search;
			} else {
				self = this;
			}
			var val = self.ui.state.val().trim(),
					len = val.length,
					keyCode = e.keyCode;
			if ((len > 4 || len === 0 ) && keyCode !== 13 && keyCode !== 9&& keyCode !== 38 && keyCode !== 40) {
				self.stateZip = '';
				self.zipcode = val;
				self.onSearchTherapist();
			}
		},

		infiniteScrolling: function() {

		},

		onSearchTherapist: function(that) {
			var self;
			if (!this.ui) {
				self = search;
			} else {
				self = this;
			}
			var name = self.ui.name.val().trim(),
					speciality = self.ui.specialty.val().trim(),
					therapist_type = self.ui.provider.val().trim(),
					payment_type = self.ui.payment.val().trim(),
					state = self.stateZip,
					zipcode = self.zipcode;

			self.urlParam = {
				speciality: speciality,
				therapist_type: therapist_type,
				payment_type: payment_type,
				state: state,
				zipcode: zipcode,
				name: name,
				page: 1
			};

			self.onRenderSearchResult(['/therapist/search.json', $.param(self.urlParam)].join('?'));
			history.replaceState("object or string", "title", "/therapist/searchresult?" + $.param(self.urlParam));

			// if (speciality || therapist_type || payment_type || state || name || zipcode) {
			// } else {
			// 	this.SearchCollectionView.collection.reset([]);
			// 	this.ui.listResult.find('li').hide();
			// }
		},

		onRenderSearchResult: function(url) {
			this.SearchCollectionView.collection.url = url;
			console.log(this.SearchCollectionView.collection.url);
			this.SearchCollectionView.collection.fetch();
			history.replaceState("object or string", "title", "/therapist/searchresult?" + url);
		},

		loadMoreResult: function() {
			console.log('Load more');
			var self = this;
			this.urlParam.page = this.urlParam.page + 1;
			api.get(['/therapist/search.json', $.param(self.urlParam)].join('?'), function(err, res) {
				console.log(res);
				if (res.result.length >= 10)
					self.SearchCollectionView.collection.add(res.result);
				else
					self.loadMore = true;

				history.replaceState("object or string", "title", "/therapist/searchresult?" + $.param(self.urlParam));
			});

		},

		onRender: function() {
			console.log('App.Render: Search Therapist View');
			search = this;
			var self = this,
					$container = $('.content-container'),
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
			this.SearchCollectionView = new SearchResult();

			var currentUrl = window.location.href;
			var url = purl(currentUrl).attr('query');
			if (url) {
				var params = purl(currentUrl).param();
				// update values
				self.urlParam = {
					speciality: params.speciality,
					therapist_type: params.therapist_type,
					payment_type: params.payment_type
				};
				this.ui.specialty.val(params.speciality);
				this.ui.provider.val(params.therapist_type);
				this.ui.payment.val(params.payment_type);
				
				var stateId = Number(params.state);
				if (stateId && stateId !== '') {
					_.each(gon.state_cdes, function(state) {
						if (Number(state.state_id) === stateId) {
							self.ui.state.val(state.name);
							self.urlParam.state = state.name;
							return {};
						}
					});
					
				} else {
					self.ui.state.val(params.zipcode);
					self.urlParam.zipcode = params.zipcode;
				}
				self.urlParam.page = 1;
				this.urlParam.name = params.name;
				this.ui.name.val(params.name);
				url = url.substring(0, url.length - 1);
				url = url + self.urlParam.page;

				// start search
				this.onRenderSearchResult('/therapist/search.json?' + url);
			}

			// initialize chosen plugin
      this.ui.specialty.chosen({width: "100%"});
      this.ui.provider.chosen({width: "100%"});
      this.ui.payment.chosen({width: "100%"});
      // this.ui.state.chosen({width: "100%"});
      this.ui.state.on('keyup', _.debounce(this.onKeypressStateZip, 500));
      this.ui.name.on('keyup', _.debounce(this.onSearchTherapist, 500));

      var infiniteScroll = _.debounce(function() {
      	if($(window).scrollTop() + $(window).height() >= ($(document).height() - 100)) {
      		if (!self.loadMore) {
      			self.loadMoreResult();
      		}
      	}
      }, 100);

      // implemented infinite scrolling
      $(window).scroll(infiniteScroll);
		}
	});

	return SearchTherapist;
});