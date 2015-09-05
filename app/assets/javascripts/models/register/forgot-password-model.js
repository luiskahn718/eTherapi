define([
  'models/base',
  'conf'
], function(Model, conf) {
  'use strict';
  var ForgotPasswordModel = Model.extend({
    url: '/users/password',

    validation: {
      email_forgotpass: [{
        required: true,
        msg: 'Email is required'
      },{ 
        pattern: 'email',
        msg: 'Please enter your account\'s email'
      }]

    }

  });

  return ForgotPasswordModel;
});