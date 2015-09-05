define([
  'models/base',
  'conf'
], function(Model, conf) {
  'use strict';
  var SignUpModel = Model.extend({
    url: '/users',

    defaults: {

    },

    validation: {
      email: [{
        required: true,
        msg: 'Email is required'
      },{ 
        pattern: 'email',
        msg: 'Invalid email or password'
      }],

      first_name: {
        required: true,
        msg: 'First name is required'
      },

      last_name: {
        required: true,
        msg: 'Last name is required'
      },

      password: {
        minLength: 8,
        msg: 'Password must be at least 8 characters'
      },

      password_confirmation: [
        {
          required: true,
          msg: 'Confirm password is required'
        },{
          equalTo: 'password',
          msg: "Password confirmation doesn't match Password"
        }],
      account_type: {
        required: true,
        msg: 'Account type is required'
      }

    },

    sync: function (method, model, options) {
      switch (method) {
        case 'create':
          console.log('options', options);
          options.data = {
            authenticity_token: options.data.authenticity_token,
            account_type: options.data.account_type,
            user: {
              email: model.get('email'),
              password: model.get('password'),
              first_name: model.get('first_name'),
              last_name: model.get('last_name'),
              password_confirmation: model.get('password_confirmation'),
              account_type: model.get('account_type')
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

  return SignUpModel;
});