define([
  //templates
  'hbs!templates/register/reset-password',
  'models/register/reset-password-model',
  'api',
  'conf',
  'stickit',
  'purl'

], function (
  resetPasswordTpl,
  ResetPassWordModel,
  api,
  conf,
  stickit,
  purl
){
  'use strict';
  var ResetPasswordView = Backbone.Marionette.ItemView.extend({

    template: resetPasswordTpl,

    el: '.reset-password-container',

    events: {
      'click .save-btn': 'onResetPassWord',
      'click .switch': 'onAgree'
    },

    ui: {
      switchBtn: '.switch',
      saveBtn: '.save-btn',
      agree: '.agree',
      confirmPassword: '#confirm_password',
      password: '#password'
    },

    bindings: {
      '#password': 'password',
      '#confirm_password': 'confirm_password'
    },

    initialize: function() {

      this.currentRoute = purl(window.href).attr('query').substring(21);

      this.model = new ResetPassWordModel();
      this.render();
    },

    onResetPassWord: function() {
      console.log('onResetPassWord');

      var password = this.model.get('password'),
          passwordConfirm = this.model.get('confirm_password');

      var self = this,
          data = {
            authenticity_token: conf.tokenDefault,
            user: {
              password: password,
              password_confirmation: passwordConfirm,
              reset_password_token: this.currentRoute
            }
          },
          isValid = this.model.isValid(true);


      this.model.set(data);

      console.log('data', data);
      if(isValid) {
        api.put('/users/password', data, function(err, res) {
          console.log(err, res);
          if (err && err.status === 200 || res) {
            window.location = '/';
          } else {
            console.log('save err');
          }
        });
        // this.model.save(null, {
        //   data: data,
          
        //   success: function(model, res, options) {
        //     console.log('reset-password save success');
        //   },
        //   error: function(model, res, options) {
        //     console.log('reset-password save error');
        //   }
        // });
        
      }
    },

    onShowLoginMoal: function() {
      $('#reset-password-modal').modal('hide');
    },

    onRender: function() {
     
      this.stickit();
      // initialize practice details backbone validation
      Backbone.Validation.bind(this, {
        selector: 'id'
      });

      // initialize account info backbone validation
     /* Backbone.Validation.bind(this, {
        selector: 'id',
        model: this.model
      });*/

      this.ui.switchBtn.tooltip({
        placement: 'top',
        title: 'Agree to the terms'
      });

      // if not check input agree with term
      if(!this.checkedAgree) {
        this.ui.saveBtn.attr('disabled','disabled')
      }
    },

    onAgree: function() {
      var checked = this.ui.agree.is(':checked');

      this.checkedAgree = checked;

      console.log('checked', checked);
      if(!this.checkedAgree) {
        this.ui.saveBtn.attr('disabled','disabled')
      } else {
        this.ui.saveBtn.removeAttr('disabled');
      }
    }


  });
  //conf.applyValidateView(ResetPasswordView);

  return ResetPasswordView;

});