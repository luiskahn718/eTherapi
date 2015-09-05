define([
  'hbs!templates/patient/billing/del-card-modal',
  'backbone-eventbroker'
], function (confirmTpl, EventBroker) {
  'use strict';

  var ConfirmModalView = Backbone.Marionette.ItemView.extend({

    template: confirmTpl,

    ui: {
     modalDelete: '#confirm-del-card'
    },

    events: {
      'click .btn-yes': 'onClickYesBtn'
    },

    onClickYesBtn: function() {
      console.log('delete card modal');
      //trigger delete card
      Backbone.EventBroker.trigger('delete:card');

      //hide modal delete card
      this.ui.modalDelete.modal('hide');
    }

  });

  return ConfirmModalView;
});