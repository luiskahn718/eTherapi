define([
  //templates
  'hbs!templates/register/sign-up-modal',
  'models/register/sign-up-model',
  'api',
  'conf',
  'stickit'

], function (
  signUpModalTpl,
  UserModel,
  api,
  conf,
  stickit
){
  'use strict';
  var SignUpModalView = Backbone.Marionette.ItemView.extend({
    template: signUpModalTpl,

    events: {
      'click .sign-up-btn': 'onSignUp',
      'click .login': 'onShowLoginModal',
      'click .switch': 'onAgree'
    },

    ui: {
      therapistAccount: '#therapist-account',
      patientAccount: '#patient-account',
      messageErrorAccountTherapist: '#account-type-therapist',
      messageErrorAccountPatient: '#account-type-patient',
      firstName: '#first_name',
      lastName: '#last_name',
      email: '#email',
      messageErrorEmail: '#msg-email',
      agree: '.agree',
      confirmPass: '#password_confirmation',
      messageErrorFirstName: '#msg-firstname',
      messageErrorLastName: '#msg-lastname',
      signUpBtn: '.sign-up-btn',
      switchBtn: '.switch'
    },

    bindings: {
      '#first_name': 'first_name',
      '#last_name': 'last_name',
      '#email': 'email',
      '#password': 'password',
      '#password_confirmation': 'password_confirmation',
      '#account_type': 'account_type'
    },

    initialize: function() {
      console.log('onInit sign-up modal');
      this.model = new UserModel();
      this.checkedAgree = false;
    },

    onSignUp: function() {
     
      var accountType = this.$('#therapist-account:checked').val() || this.$('#patient-account:checked').val(),
      //this.ui.therapistAccount.val() || this.ui.patientAccount.val(),
        self = this;

      this.model.set('account_type',accountType);

      var data = {
        authenticity_token: conf.token,
        account_type: this.model.get('account_type'),
        user: this.model.toJSON()
      },
      isValid = this.model.isValid(true);

      console.log('data', data);
      if (accountType) {
        if (isValid) {
          api.post('/users', data, function(err, res) {
            console.log(err, res);
            if (err) {
              self.$('.email-message').append('<p class="help-block error-message" id="msg-email"></p>')
              console.log('save err')
              var string = err.responseText,
                textError = string.match(/Email has already been taken/i);

              if(textError) {
                self.$('#msg-email').html('Email has already been taken');
                self.ui.email.closest('.form-group').addClass('has-error');
              }

            } else {
              self.$('#signup-modal').modal('hide');

              //show confirm sign up success
              $('#sign-up-confirmation-modal').modal('show');
              
              console.log('save success');
              self.ui.email.html('');
              self.ui.email.closest('.form-group').removeClass('has-error');
            }
          });
          /*this.model.save(this.model.toJSON(), {
            data: data,

            success: function(model, res, options) {
              self.$('#signup-modal').modal('hide');

              //show confirm sign up success
              $('#sign-up-confirmation-modal').modal('show');
              
              console.log('save success');
              self.ui.messageErrorEmail.html('');
              self.ui.email.closest('.form-group').removeClass('has-error');
            },

            error: function(model, res, options) {
              self.$('.email-message').append('<p class="help-block error-message" id="msg-email"></p>')
              console.log('save err')
              var string = res.responseText,
                textError = string.match(/Email has already been taken/i);

              if(textError) {
                self.$('#msg-email').html('Email has already been taken');
                self.ui.email.closest('.form-group').addClass('has-error');
              }
            }
          });*/
          
        }

        self.ui.messageErrorAccountTherapist.html('');
  

      } else {
        if (!accountType) {
          self.ui.messageErrorAccountTherapist.html('Please select account type');
          self.ui.therapistAccount.closest('.form-group').addClass('has-error');
          self.ui.patientAccount.closest('.form-group').addClass('has-error');
          
        } 
      }
  
    },

    onShowLoginModal: function() {
      $('#signup-modal').modal('hide');
      $('#login-modal').modal('show');
    },

    onRender: function() {
     
      this.stickit();
      // initialize practice details backbone validation
      Backbone.Validation.bind(this, {
        selector: 'id'
      });

      // initialize account info backbone validation
      /*Backbone.Validation.bind(this, {
        selector: 'id',
        model: this.model
      });*/
      this.ui.switchBtn.tooltip({
        placement: 'top',
        title: 'Agree to the terms'
      });

      if(!this.checkedAgree) {
        this.ui.signUpBtn.attr('disabled','disabled')
      }
    },

    onAgree: function() {
      var checked = this.ui.agree.is(':checked');

      this.checkedAgree = checked;

      console.log('checked', checked);
      if(!this.checkedAgree) {
        this.ui.signUpBtn.attr('disabled','disabled')
      } else {
        this.ui.signUpBtn.removeAttr('disabled');
      }
    }

  });

  //conf.applyValidateView(SignUpModalView);
  
  return SignUpModalView;

});