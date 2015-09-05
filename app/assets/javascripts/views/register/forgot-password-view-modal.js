define([
  //templates
  'hbs!templates/register/forgot-password-modal',
  'models/register/forgot-password-model',
  'api',
  'conf',
  'stickit'

], function (
  forgotPasswordModalTpl,
  UserModel,
  api,
  conf,
  stickit
){
  'use strict';
  var ForgotPasswordModalView = Backbone.Marionette.ItemView.extend({
    
    template: forgotPasswordModalTpl,

    events: {
      'click .reset-password-btn': 'onResetPassWord',
      'click .login': 'onShowLoginMoal'
    },

    bindings: {
      '#email_forgotpass': 'email_forgotpass'
    },

    ui:  {
      emailForgotpass: '#email_forgotpass',
      errMsg: '.emailForgotpass',
      groupEmail: '.group-email',
      emailSentTxt: '.notify-email-status'
    },

    initialize: function() {
      console.log('onInit onResetPassWord modal');
      this.model = new UserModel();
    },

    onResetPassWord: function() {
      console.log('onResetPassWord');

      var self = this,
        data = {
        authenticity_token: conf.token,
        user: {
          email: this.model.get('email_forgotpass')
        }
      };
        

      console.log('data', data);
      var isValid = this.model.isValid(true);

      this.model.set(data);

      if(isValid) {
        api.post('/users/password', data, function(err, res) {
          console.log(err, res);
          if (res.status === 422) {
            self.ui.groupEmail.append('<p class="help-block error-message"></p>')
            self.ui.emailForgotpass.closest('.form-group').addClass('has-error');
            self.$('.error-message').html('We cannot recognize this email address');
            console.log('save err')
          } else {
            
            self.ui.emailForgotpass.closest('.form-group').removeClass('has-error');
            self.ui.emailSentTxt.removeClass('display-none');


            //close modal after 5 second
            setTimeout(function() {
              self.$('#reset-password-modal').modal('hide');
              self.ui.emailSentTxt.addClass('display-none');
            }, 5000);

            self.$('.error-message').html('');
            //self.successSavedSetting();
            
            console.log('save success');
          }
        });
        /*this.model.sync('create', this.model, {
          success: function(res) {
            self.$('#reset-password-modal').modal('hide');
            console.log('save success');
          }, 

          error: function(res) {
            console.log('save err')
          }
        });*/
      }
    },

    successSavedSetting: function() {
      // fadein success notification
      var notification = $('#sub-header-notification');
      notification.show();
      notification.addClass('themed-background-success').fadeIn('slow');
      notification.find('.content').html('The password reset email has been sent.');
      $("html, body").animate({ scrollTop: 0 }, 300);

      // fadeon success notification after 10s
      setTimeout(function() {
        notification.fadeOut('slow');
      }, 10000);
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
    }

  });
  //conf.applyValidateView(ForgotPasswordModalView);

  return ForgotPasswordModalView;

});