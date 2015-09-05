define([
  //templates
  'hbs!templates/register/login-modal',
  'models/register/login-model',
  'views/layout/sidebar',
  'views/layout/header',
  'api',
  'conf',
  'stickit',
  'backbone-eventbroker',
  'purl'

], function (
  loginModalTpl,
  LoginModel,
  SidebarView,
  HeaderView,
  api,
  conf,
  stickit,
  EventBroker,
  purl
){
  'use strict';
  var LoginModalView = Backbone.Marionette.ItemView.extend({
    template: loginModalTpl,

    events: {
      'click .login-modal': 'onSignIn',
      'click .reset-password-btn': 'onShowResetPassWord',
      'click .sign-up': 'onShowSignUpModal',
      'click .switch': 'rememberPassword'
    },

    bindings: {
      '#email_login': 'email_login',
      '#password_login': 'password_login'
    },

    ui: {
      email: '#email_login',
      password: '#password_login',
      rememberPassword: '.remember-me',
      switchBtn: '.switch',
      msgErrorPass: '#msg-error-password',
      inputGroupPassword: '.error-from-server'
    },

    initialize: function() {
      console.log('onInit login modal');
      this.model = new LoginModel();
      this.bRememberPassword = 0;
      this.currentRoute = purl(window.href).attr('directory');
    },

    onSignIn: function() {
      console.log('onSignIn');

      var data = {
        authenticity_token: conf.token,
        user: {
          email: this.model.get('email_login'),
          password: this.model.get('password_login')
        },
        remember_me: this.bRememberPassword
      },
      self = this;

      console.log('data', data);
      var isValid = this.model.isValid(true);


      this.model.set(data);

      // save password
      if(isValid) {
      
        this.model.save(this.model.toJSON(), {
          data: data,
          success: function(model, res, options) {
            console.log(res);
            console.log('save success');
            self.$('#login-modal').modal('hide');
            self.render();
            self.ui.email.closest('.form-group').removeClass('has-error');
            self.ui.password.closest('.form-group').removeClass('has-error');
            self.ui.msgErrorPass.val('');

            //redirect after login success
            if(res.first_login) {
              if(res.user.account_type.toLowerCase() === 'therapist') {
                window.location = '/therapist/' + res.user.user_id + '/edit';
              } else {
                window.location = '/patient/' + res.user.user_id + '/edit';
              }
            } else {
              window.location = '/appointments';
            }

            if (self.currentRoute === '/' || self.currentRoute === '/site/therapist') {
              var nav = $('#nav');
              nav.find('.login-btn').parent().hide();
              nav.find('.sign-up-btn').parent().hide();
              $('.sign-up-btn').css('visibility', 'hidden');
              nav.find('ul').append('<li><a href="/appointments">Appointments</a></li>');
              if (res.user.account_type.toLowerCase() === 'therapist')
                nav.find('ul').append('<li><a href="/therapist/'+res.user.user_id+'/edit">'+[res.user.first_name, res.user.last_name].join(' ')+'</a></li>');
              else
                nav.find('ul').append('<li><a href="/patient/'+res.user.user_id+'/edit">'+[res.user.first_name, res.user.last_name].join(' ')+'</a></li>');
              nav.find('ul').append('<li><a href="javascript:void(0)" id="logout-btn" class="btn btn-primary">Logout</a></li>');
              $('#logout-btn').show();
            } else {
              Backbone.EventBroker.trigger('login:success', res);

              //render sibar after login success
              var $content = $('.content-container'),
                  $headerUserName = $('#header-username'),
                  userName = [res.user.first_name, res.user.last_name].join(' ');

              self.sidebarView = new SidebarView(res);

              //new header
              self.headerView = new HeaderView(res);
              
              // add class logged-in for header when login success
              var mainHeader = $('.main-header');
              mainHeader.addClass('logged-in');
              if (res.user.account_type.toLowerCase() === 'patient')
                mainHeader.addClass('patient-logged');

              //update value name in header
              $headerUserName.text(userName);
            }
          },
          error: function(model, res, options) {
            self.ui.inputGroupPassword.append('<p class="help-block error-message" id="msg-error-password"></p>')
            self.ui.email.closest('.form-group').addClass('has-error');
            self.ui.password.closest('.form-group').addClass('has-error');
            self.$('#msg-error-password').html(JSON.parse(res.responseText).error);
            //self.$('#msg-error-email').html(JSON.parse(err.responseText).error);
          }
        });
      }
    },

    onShowResetPassWord: function() {
      console.log('onResetPassWordWhenLogin');
      $('#login-modal').modal('hide');
    },

    onShowSignUpModal: function() {
      console.log('onShowSignUpModal');
      $('#signup-modal').modal('show');
      $('#login-modal').modal('hide');
    },

    onRender: function() {
      this.stickit();
      // initialize practice details backbone validation
      Backbone.Validation.bind(this, {
        selector: 'id'
      });
      this.ui.switchBtn.tooltip({
        placement: 'top',
        title: 'Remember Me'
      });
    },

    rememberPassword: function() {
      var checked = this.ui.rememberPassword.is(':checked');

      this.bRememberPassword = checked ? 1 : 0;
      
      console.log('bRememberPassword',this.bRememberPassword);
    }

  });
  
  //conf.applyValidateView(LoginModalView);

  return LoginModalView;

});