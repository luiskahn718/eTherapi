define([
	'hbs!templates/therapist/search/search-item'
], function(itemTpl) {
	'use strict';

	var SearchTherapistItem = Backbone.Marionette.ItemView.extend({
		tagName: 'li',
		template: itemTpl,

    ui: {
      iframe: 'iframe'
    },

    onRender: function() {
      var url = this.ui.iframe.attr('src');

      if(url) {

        this.ui.iframe.attr('src', url + '?wmode=transparent&hd=1&rel=0&autohide=1&showinfo=0');
      }
    }
	});

	return SearchTherapistItem;
});