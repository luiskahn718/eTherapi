define([
  'hbs!templates/patient/insurance/insurance-item',
  'models/patient/insurance-model',
  'backbone-eventbroker'
], function (insuranceTpl, InsuranceModel, EventBroker) {
  'use strict';

  var InsuranceView = Backbone.Marionette.ItemView.extend({

    template: insuranceTpl,
    
    className: 'striped-row col-md-12 no-gutter',

    events: {
      'click .delete-insurance': 'showModalConfirm'
    },

    initialize: function() {
      this.modelInsurance = new InsuranceModel();
    },

    serializeData: function() {
      var idInsurance = this.model.get('insurance_payer_id'),
        name = this.getNameInsurance(gon.insurance_payers_name, idInsurance);

      this.model.set('insurance_name', name);
      
      console.log('name', name);

      return this.model.toJSON();
    },

    getNameInsurance: function(insuranceArray, id) {
      var name = '';
      _.each(insuranceArray, function (item) {
        if(item.id === parseInt(id)) {
          name = item.payers_name;
        }
      });
      return name;
    },

    onDeleteInsurance: function() {
      this.model.set('_destroy', true);
      if(this.model.has('patient_insurance_id')) {
        this.model.set('id', this.model.get('patient_insurance_id'));
      }

      var insuranceArray = [],
          max = 128,
          min = 0,
          ssn = this.model.get('ssn'),
          self = this;

        if(ssn){
          var ssnFormat = ssn.split('-').join('');
        }

        if(this.model.has('_destroy')) {
          this.model.set('seq', Math.floor(Math.random() * (max - min + 1)) + min);
          //this.model.unset('ssn',  { silent: true });
          //this.model.set('ssn', ssnFormat);
        }
        // push data
        insuranceArray.push(this.model.toJSON());

        //set attribute for model
        this.modelInsurance.set('patient', {});
        this.modelInsurance.attributes.patient.patient_insurance_attributes = insuranceArray;

        this.modelInsurance.sync('update', this.modelInsurance, {
          success: function(res) {
            //console.log('insurance delete success', res);
            self.model.clear(self.model, { silent: true });
            self.$el.remove();
          }
        });
    },

    showModalConfirm: function() {
      $('#confirm-del-insurance').modal('show');
      EventBroker.register({
        'delete:insurance': 'onDeleteInsurance'
      }, this);
    }

  });

  return InsuranceView;
});