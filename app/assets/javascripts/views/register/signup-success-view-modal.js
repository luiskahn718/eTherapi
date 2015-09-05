define([
  //templates
  'hbs!templates/register/signup-success',
  'models/register/sign-up-model',
  'api',
  'conf',
  'stickit'

], function (
  signupSuccessTpl,
  UserModel,
  api,
  conf,
  stickit
){
  'use strict';
  var SignUpSuccessModalView = Backbone.Marionette.ItemView.extend({
    template: signupSuccessTpl,

    events: {
      'click .sign-in-btn': 'onShowLoginModal'
    },


    onShowLoginModal: function() {
      this.$('#sign-up-confirmation-modal').modal('hide');
    }

  });

  return SignUpSuccessModalView;

});