define([
  'hbs!templates/patient/insurance/confirm-delete-insurance-modal',
  'backbone-eventbroker'
], function (confirmTpl, EventBroker) {
  'use strict';

  var ConfirmModalView = Backbone.Marionette.ItemView.extend({

    template: confirmTpl,

    ui: {
     modalDelete: '#confirm-del-insurance'
    },

    events: {
      'click .btn-yes': 'onClickYesBtn'
    },

    onClickYesBtn: function() {
      //trigger delete insurance
      Backbone.EventBroker.trigger('delete:insurance');

      //hide modal delete insurance
      this.ui.modalDelete.modal('hide');
    }

  });

  return ConfirmModalView;
});