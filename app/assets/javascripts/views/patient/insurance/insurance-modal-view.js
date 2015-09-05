define([
  //templates
  'hbs!templates/patient/insurance/insurance-modal',
  'models/patient/insurance-model',
  'api',
  'conf',
  'stickit',
  'backbone-eventbroker',
  'chosen',
  'datepicker',
  'maskedInput'

], function (
  insuranceModalTpl,
  InsuranceModel,
  api,
  conf,
  stickit,
  EventBroker
){
  'use strict';
  var InsuranceModalView = Backbone.Marionette.ItemView.extend({

    template: insuranceModalTpl,

    events: {
      'click .save-btn': 'onSaveInsurance',
      'change select#subscriber_relationship': 'onChangeSelectRelationship'
    },

    bindings: {
      '#plan_name': 'plan_name',
      '#subscriber_id': 'subscriber_id',
      '#ssn': 'ssn',
      '#subscriber_first_name':'subscriber_first_name',
      '#subscriber_last_name': 'subscriber_last_name',
      '#subscriber_dob': 'subscriber_dob',
      '#subscriber_address1': 'subscriber_address1',
      '#subscriber_city': 'subscriber_city',
      '#subscriber_state_cde': 'subscriber_state_cde',
      '#subscriber_zipcode': 'subscriber_zipcode',
      '#insurance_payer_id': 'insurance_payer_id',
      '#subscriber_relationship': 'subscriber_relationship'

    },

    ui: {
      relationship: '#subscriber_relationship',
      healthInsuranceName: '#insurance_payer_id',
      planName: '#plan_name',
      firstname: '#subscriber_first_name',
      lastname: '#subscriber_last_name',
      birthdate: '.select-birthdate',
      street: '#subscriber_address1',
      city: '#subscriber_city',
      state: '#subscriber_state_cde',
      zipcode: '#subscriber_zipcode',
      ssn: '#ssn',
      memberID: '#subscriber_id',
      inputInsurance: 'input',
      selectInsurance: 'select',
      btnSave: '.save-btn'
    },

    initialize: function() {
      console.log('onInit login modal');
      this.model = new InsuranceModel();
      this.modelInsurance = new InsuranceModel();
      this.patientProfile = {
        patient : gon.patient,
        insurance : gon.insurance_payers_name,
        state: gon.state_cdes
      }
    },

    serializeData: function() {
      this.patientProfile.insurance = this.sortInsurance();
      return this.patientProfile
    },

    onSaveInsurance: function() {
      console.log('onSaveInsurance');
      this.ui.btnSave.attr("disabled","disabled");
      this.model.set('_destroy', false);

      var data = this.model.toJSON(),
        self = this;

      var isValid = this.model.isValid(true);

      console.log('data', data);
    
      if(isValid) {
        var insuranceArray = [],
          max = 128,
          min = 0,
          ssn = this.model.get('ssn');

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
            console.log('insurance saved success', res);
            self.ui.btnSave.removeAttr("disabled");
            
            Backbone.EventBroker.trigger('add:newInsurance', self.model, res);
            /*self.ui.inputInsurance.val('');
            self.ui.selectInsurance.find('option:first-child').prop('selected', true);*/
            self.$('.chosen-container').find('span').text('');
            _.each(self.model.attributes, function(index, value){
              //console.log('index value', index, value);
              self.model.set(value, '');
            });

            $('#profile-insurance-modal').modal('hide');
          }
        });

              
      }
    },

    onRender: function() {
      var self = this;

      this.stickit();
      // initialize practice details backbone validation
      Backbone.Validation.bind(this, {
        selector: 'id'
      });

      // initialize account info backbone validation
      Backbone.Validation.bind(this, {
        selector: 'id',
        model: this.model
      });
      this.$el.find('.select-chosen').chosen({width: "100%"});

      this.ui.birthdate.datepicker({weekStart: 1});

      this.ui.ssn.mask("999-99-9999");

    },

    onChangeSelectRelationship: function() {
      var relationship = this.ui.relationship.val();

      if (relationship === 'self') {
      
        this.model.set('subscriber_first_name', gon.patient.first_name);
        this.model.set('subscriber_last_name', gon.patient.last_name);
        this.model.set('subscriber_dob', gon.patient.date_of_birth);
        this.model.set('subscriber_address1', gon.patient.address1);
        this.model.set('subscriber_city', gon.patient.city);
        this.model.set('subscriber_zipcode',gon.patient.zipcode);
        this.model.set('subscriber_state_cde', gon.patient.state_cde);

      } else {
        this.model.set('subscriber_first_name', '');
        this.model.set('subscriber_last_name', '');
        this.model.set('subscriber_dob', '');
        this.model.set('subscriber_address1', '');
        this.model.set('subscriber_city', '');
        this.model.set('subscriber_zipcode', '');
        this.model.set('subscriber_state_cde', '');
      }

      console.log('change select', relationship);
    },

    sortInsurance: function() {
      var listInsurance = _.sortBy(this.patientProfile.insurance, function(item) {
        return item.payers_name;
      });

      return listInsurance;
      console.log('insurance',listInsurance);
    }

  });
  
  //conf.applyValidateView(InsuranceModalView);

  return InsuranceModalView;

});