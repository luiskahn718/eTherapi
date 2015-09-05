define([
  'models/base',
  'conf'
], function(Model, conf) {
  'use strict';
  var InsuranceModel = Model.extend({
    url: function() {
      return ['/patient/', encodeURIComponent(gon.patient.patient_id), '.json?authenticity_token=', conf.token].join('');
    },

    defaults: {
      //'id': '',
      //'_destroy': false
    },

    validation: {

      plan_name: {
        required: true,
        msg: 'Insurance Plan Name id is required'
      },

      insurance_payer_id: {
        required: true,
        msg: 'Health Insurance Name id is required'
      },

      subscriber_relationship: {
        required: true,
        msg: 'Relationship is required'
      },

      subscriber_id: [{
        required: true,
        msg: 'Insurance id is required'
      },{
        pattern: 'variable_name',
        msg: 'Insurance Member Id invalid'
      }],

      ssn: [{
        required: true,
        msg: 'SSN is required'
      }],

      subscriber_first_name: {
        required: true,
        msg: 'First name is required'
      },

      subscriber_last_name: {
        required: true,
        msg: 'Last name is required'
      },

      subscriber_dob: {
        required: true,
        msg: 'Birth date is required'
      },

      subscriber_address1: {
        required: true,
        msg: 'Street Address is required'
      },

      subscriber_city: {
        required: true,
        msg: 'City is required'
      },

      subscriber_state_cde: {
        required: true,
        msg: 'State is required'
      },

      subscriber_zipcode: [
        {
          required: true,
          msg: 'Zip Code is required'
        },{
          pattern: 'number',
          msg: 'Please enter only digits!' 
        }
      ]
    }

  });

  return InsuranceModel;
});