define([
  'hbs!templates/patient/insurance/empty-insurance'
], function(
  EmptyTpl
) {
  'use strict';

  var ListInsurance = Backbone.Marionette.ItemView.extend({
    template: EmptyTpl
  });

  return ListInsurance;
});