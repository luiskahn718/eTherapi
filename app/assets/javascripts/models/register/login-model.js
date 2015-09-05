define([
  'models/base',
  'conf'
], function(Model, conf) {
  'use strict';
  var LoginModel = Model.extend({
    url: '/users/sign_in',

    validation: {
      email_login: [{
        required: true,
        msg: 'Email is required'
      },{ 
        pattern: 'email',
        msg: 'Invalid email or password'//Please enter your account\'s email
      }],

      password_login: {
        minLength: 8,
        msg: 'Invalid email or password'
      }, 

    },

    sync: function (method, model, options) {
      switch (method) {
        case 'create':
          console.log('options', options);
          options.data = {
            authenticity_token: options.data.authenticity_token,
            user: {
              email: model.get('email_login'),
              password: model.get('password_login'),
              remember_me: options.data.remember_me
            }
          }
        break;
          
      }
      options.data = JSON.stringify(options.data);
      options.headers = {
        'Content-Type': 'application/json'
      };
      Backbone.Model.prototype.sync.call(this, method, model, options);
    }

  });

  return LoginModel;
});