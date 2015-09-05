define([
  'collections/patient/insurance-collection',
  'models/patient/insurance-model',
  'views/patient/insurance/insurance-itemview',
  'views/patient/insurance/empty-insuarance-view',
  'backbone-eventbroker'
], function (
  InsuranceCollection,
  InsuranceModel,
  InsuranceItemView,
  EmptyViewInsurance,
  EventBroker
) {
  'use strict';

  var InsuranceCollectionView = Backbone.Marionette.CollectionView.extend({

    el: '.data-group',

    itemView: InsuranceItemView,

    emptyView: EmptyViewInsurance,

    initialize: function(opts) {
      var data = [];

     
      this.collection = new InsuranceCollection(opts);
      this.render();

      //register event add new insurance
      EventBroker.register({
        'add:newInsurance':  'addInsurance'
      }, this);
    },

    addInsurance: function(model, res) {
      var modelInsurance = new InsuranceModel(),
        len = res.patient_insurances.length;

      modelInsurance.set(model.attributes);
      modelInsurance.set('patient_insurance_id', res.patient_insurances[len -1].patient_insurance_id);
      console.log('res[0].patient_insurance_id', res.patient_insurances[len - 1].patient_insurance_id);
      this.collection.add(modelInsurance);
      
      console.log('collection', this.collection);

    }

  });

  return InsuranceCollectionView;
});