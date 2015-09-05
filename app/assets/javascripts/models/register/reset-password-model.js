define([
  'models/base',
  'conf'
], function(Model, conf) {
  'use strict';
  var UserModel = Model.extend({

    url: '/users/password',

    validation: {

      password: {
        minLength: 8,
        msg: 'Invalid email or password'
      },

      confirm_password: [
        {
          required: true,
          msg: 'Confirm password is required'
        },{
          equalTo: 'password',
          msg: "Password confirmation doesn't match Password"
        }] 

    },

    sync: function (method, model, options) {
      switch (method) {
        case 'create':
          method = 'update';
          console.log('options', options);
          options.data = {
            authenticity_token: options.data.authenticity_token,
            user: {
              password: model.get('password'),
              password_confirmation: model.get('confirm_password'),
              reset_password_token: options.data.user.reset_password_token
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

  return UserModel;
});