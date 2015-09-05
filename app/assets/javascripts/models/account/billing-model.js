define([
  'models/base',
  'conf'
], function(Model, conf) {
  'use strict';
  var BillingModel = Model.extend({

    validation: {

      cvc_txt:[{
        required: true,
      },{
        pattern: 'number',
        msg: 'Please enter a number'
      },{
        minLength: 3,
        msg: 'Please enter valid CVC'
      }, {
        maxLength: 4,
        msg: 'Please enter valid CVC'
      }]
    }

  });

  return BillingModel;
});