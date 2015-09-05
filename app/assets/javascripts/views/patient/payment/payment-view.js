define([
  'hbs!templates/patient/payment/patient-payment',
  'views/patient/insurance/insurance-modal-view',
  'api',
  'conf',
  'moment-timezone',
  'backbone-eventbroker',
  'chosen'
], function(
  patientPaymentTpl,
  InsuranceModalView,
  api,
  conf,
  moment,
  EventBroker
) {
  'use strict';
  var PatientPayment = Backbone.Marionette.ItemView.extend({
    el: '#patient-payment-container',
    template: patientPaymentTpl,

    ui: {
      requestBtn: '#request-appointment-btn',
      agreeTerm: '#term-cb',
      agreeRules: '#rules-cb',
      insurance: '#insurance-chosen',
      card: '#card-chosen',
      errTxt: '#err-stripe-msg',
      total: '#total-amount',
      insuranceFee: '#insurance-fee',
      paymentErr: '#payment-error-txt',
      verifyBtn: '#verify-insurance-btn',
      estimatedRow: '#estimated-coverage-row',
      totalRow: '#total-row',
      verifiedResult: '#verified-result',
      therapistConsent: '.therapist-consent'
    },

    events: {
      'click #request-appointment-btn': 'onRequestAppointment',
      'click #verify-insurance-btn': 'onVerifyInsurance',
      'change #insurance-chosen': 'showVerifyBtn'
    },

    initialize: function(opts) {

      // new modal add insurance
      this.insuranceModalView = new InsuranceModalView();

      var self = this;
      this.processed_amt = gon.therapist_profile.hourly_rate_max;
      api.get('/patient/info.json', function(err, res) {
        console.log(err, res);
        if (res) {
          self.patientInfo = res;
          // get list car of patient
          api.get('/charges/listcards.json', function(error, response) {
            console.log(error, response);
            if (response) {
              self.patientInfo.cards = response;
              self.render();
            }

          });
        } 
      });
      this.time = opts;
      this.estimated_insurance_adjustment = 0;

      /*//register event add new insurance
      EventBroker.register({
        'add:newInsurance':  'addInsurance'
      }, this);*/
    },

    serializeData: function() {
      var info = {
        therapist: gon.therapist,
        time: this.time,
        patient: this.patientInfo,
        fee: gon.therapist_profile.hourly_rate_max,
        license: gon.therapist_license,
        therapist_consent: gon.therapist_consent
      };
      return info;
    },

    onRequestAppointment: function() {
      var self = this,
          cardVal = this.ui.card.val();
      if (cardVal !== '' || cardVal) {
        this.ui.errTxt.hide();
        this.ui.card.closest('.form-group').removeClass('has-error');
        if (this.ui.agreeTerm.is(':checked') && this.ui.agreeRules.is(':checked')) {
          var data = {
            authenticity_token: conf.tokenDefault,
            appointment: {
              start_time: this.time.appointment.start_time,
              end_time: this.time.appointment.end_time,
              date: this.time.appointment.date,
              therapist_id: gon.therapist.therapist_id,
              patient_id: this.patientInfo.patient.patient_id,
              owner_id: this.patientInfo.patient.user_id,
              consent: true,
              status: 'p',
              fee_amount: self.fee_amount,
              stripe_token: self.stripe_token,
              pre_charge_id: self.pre_charge_id,
              processed_auth_date: moment.tz((moment().format('L') + ' ' + moment().format('HH:mm')), 'Etc/UTC ').utc().format(),
              processed_amt: this.processed_amt,
              patient_ins_eligibility_id: this.patient_ins_eligibity,
              estimated_insurance_adjustment: self.estimated_insurance_adjustment
            }
          };
          console.log(data);
          if (!self.stripe_token) {
            var amount = 0;
            if (gon.therapist_profile.hourly_rate_max) {
              amount = gon.therapist_profile.hourly_rate_max;
            }
            var precharge = {
              amount: amount * 100,
              stripe_card_id: cardVal
            };
            self.ui.requestBtn.attr('disabled', 'disabled');
            // pre charge payment before request an appointment
            api.post('/charges/createprecharge', precharge, function(err, res) {
              console.log(err, res);
              if (res && !res.charge) {
                self.ui.requestBtn.removeAttr('disabled');
                alert(res.message);
              } else if (res && res.charge) {
                self.fee_amount = res.charge.amount/100;
                self.stripe_token = res.charge.customer;
                self.pre_charge_id = res.charge.id;

                data.appointment.fee_amount = res.charge.amount/100;
                data.appointment.stripe_token = res.charge.customer;
                data.appointment.pre_charge_id = res.charge.id;

                console.log(data);
                if (res) {
                  api.post('/appointments.json', data, function(error, response) {
                    console.log(error, response);
                    if (response) {
                      window.location = '/appointments?requested=true';
                    }
                  });
                }
              }
            });

          } else {
            api.post('/appointments.json', data, function(err, res) {
              console.log(err, res);
              if (res) {
                window.location = '/appointments?requested=true';
              }
            });
          }
        } else {
          this.ui.errTxt.show();
        }
      } else {
        this.ui.card.closest('.form-group').addClass('has-error');
        $("html, body").animate({ scrollTop: 100 }, 300);
      }
    },

    showVerifyBtn: function() {

      var val = this.ui.insurance.val();

      if (val === 'add-insurance') {
        console.log('add-insurance');
        $('#profile-insurance-modal').modal('show');
        //register event add new insurance
        EventBroker.register({
          'add:newInsurance':  'addInsurance'
        }, this);
      }
      this.ui.estimatedRow.hide();
      if (this.ui.insurance.val() === 'null')
        this.ui.verifyBtn.hide();
      else
        this.ui.verifyBtn.show();
      this.ui.verifiedResult.removeClass('check-failed');
      this.ui.verifiedResult.removeClass('check-success');
      this.ui.total.html(gon.therapist_profile.hourly_rate_max);
      this.patient_ins_eligibity = null;
      this.processed_amt = gon.therapist_profile.hourly_rate_max;
      this.fee_amount = gon.therapist_profile.hourly_rate_max;
      this.stripe_token = null;
      this.pre_charge_id = null;
    },

    addInsurance: function(model, res) {
      console.log('model', model, res);
      var indexInsurance = '';

      _.each(res.patient_insurances, function (item, index) {
        if (model.get('plan_name') === item.plan_name) {
          indexInsurance = index;
        }
      });
      if (indexInsurance !== '') {

        var self = this,
            len = res.patient_insurances.length,
            nameInsurance = this.getNameInsurance(model.get('insurance_payer_id')),
            id = res.patient_insurances[indexInsurance].patient_insurance_id, //model.get('insurance_payer_id'),
            planName = model.get('plan_name');

        console.log('name', nameInsurance);

        self.ui.insurance.append('<option value="' + id + '">' + nameInsurance + ' ' + planName +'</option>');
        self.ui.insurance.chosen({width: "100%"});
        self.ui.insurance.trigger("chosen:updated");
      }
    },

    getNameInsurance: function(id) {
      var name = '';
      _.each(gon.insurance_payers_name, function (item) {
        if(item.id === parseInt(id)) {
          name = item.payers_name;
        }
      });
      return name;
    },
    onVerifyInsurance: function() {
      var self = this,
          insuranceVal = self.ui.insurance.val(),
          cardVal = self.ui.card.val();
      if (cardVal !== '' || cardVal) {
        self.ui.card.closest('.form-group').removeClass('has-error');
        if ( insuranceVal !== '' || insuranceVal) {
          self.ui.insurance.closest('.form-group').removeClass('has-error');

          // var precharge = {
          //       amount: gon.therapist_profile.hourly_rate_max * 100,
          //       stripe_card_id: cardVal
          //     };
          // api.post('/charges/createprecharge', precharge, function(err, res) {
          //   console.log(err, res);
          //   self.fee_amount = res.charge.amount/100;
          //   self.stripe_token = res.charge.customer;
          //   self.pre_charge_id = res.charge.id;
          //   if (res) {
              var info = {
                    authenticity_token: conf.tokenDefault,
                    therapist_id: gon.therapist.therapist_id,
                    patient_insurance_id: self.ui.insurance.val(),
                    fee_amount: gon.therapist_profile.hourly_rate_max
                  };
              api.post('/eligible/coverage.json', info, function(error, response) {
                console.log(error, response);
                if (response.active_coverage) {
                  var insurance = Number(gon.therapist_profile.hourly_rate_max) - response.patient_amount;
                  self.estimated_insurance_adjustment = insurance;
                  
                  self.ui.verifiedResult.removeClass('check-failed');
                  self.ui.verifiedResult.addClass('check-success');
                  self.processed_amt = response.patient_amount;
                  self.patient_ins_eligibity = response.patient_ins_eligibity;
                  self.ui.total.html('$' + response.patient_amount);
                  self.ui.insuranceFee.html('$' + insurance);
                  self.ui.estimatedRow.show();
                  self.ui.verifyBtn.hide();
                } else {
                  console.log(response.message);
                  self.ui.verifiedResult.removeClass('check-success');
                  self.ui.verifiedResult.addClass('check-failed');
                  // self.ui.paymentErr.show();
                  self.ui.estimatedRow.hide();
                  self.ui.total.html(gon.therapist_profile.hourly_rate_max);
                  self.ui.verifyBtn.hide();
                }
              });

          //   }
          // });
        } else {
          self.ui.insurance.closest('.form-group').addClass('has-error');
          $("html, body").animate({ scrollTop: 100 }, 300);
        }
          
      } else {
        self.ui.card.closest('.form-group').addClass('has-error');
        $("html, body").animate({ scrollTop: 100 }, 300);
      }
    },

    onRender: function() {
      console.log('App.Render: Patient Payment');

       //append insurance modal view
      $('body').append(this.insuranceModalView.render().$el);

      var self = this;
      _.each(self.patientInfo.insurance_payers_names, function(item) {
        _.each(self.patientInfo.patient_insurances, function(insurance) {
          if (Number(item.id) === Number(insurance.insurance_payer_id)) {
            self.ui.insurance.append('<option value="' + insurance.patient_insurance_id + '">' + item.payers_name + ' ' + insurance.plan_name +'</option>');
          }
        });
      });
      _.each(self.patientInfo.cards, function(card) {
        self.ui.card.append('<option value="'+ card.id +'">' + card.type + ' xxxx-xxxx-xxxx-' + card.last4 +'</option>');
      });
      setTimeout(function() {
        self.ui.insurance.chosen({width: "100%"});
        self.ui.card.chosen({width: "100%"});
      }, 300);

      if(gon.therapist_consent) {
        this.ui.therapistConsent.append(gon.therapist_consent.consent_text);
      } else {
        this.ui.therapistConsent.append(gon.consent_template.form);
      }
    }
  });

  return PatientPayment;
});