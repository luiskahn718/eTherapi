/* Global define */
define([
  'handlebars',
  'moment',
  'moment-timezone',
  'jstz',
  'backbone-validation'
], function(
  Handlebars,
  moment,
  m
) {
  'use strict';

  var conf = {};

  conf.tokenDefault = $('#authenticity-token').attr('content');
  conf.token = encodeURIComponent(conf.tokenDefault);
  conf.waitTime = 1000*60*10;
  conf.timezone = jstz.determine().name();
  conf.regex = /(<([^>]+)>)/ig;

  ///////////////////////////////////////////////////////////////////////////
  // Implements error high lighting for backbone validation
  ///////////////////////////////////////////////////////////////////////////

  _.extend(Backbone.Validation.callbacks, {

    valid: function(view, attr, selector) {
      // compose the attr - for complex situations
      var arr = attr.split('.'),
        el = '';

      // TODO: editted here
      // for (var i = 0; i < arr.length; i++) {
      //   if (i === 0) el += arr[i];
      //   else el += '[' + arr[i] + ']';
      // }
      // always get the latest part of attr
      el = arr.length > 1 ? arr[1] : arr[0];

      var control, group;
      control = view.$('[' + selector + '="' + el + '"]');
      group = control.parents('.form-group');
      group.removeClass('has-error');

      if (control.data('error-style') === 'tooltip') {
        if (control.data('bs.tooltip')) {
          console.log('hide');
          return control.tooltip('hide');
        }
      } else if (control.data('error-style') === 'inline') {
        return group.find('.help-inline.error-message').remove();
      } else {
        return group.find('.help-block.error-message').remove();
      }
    },

    invalid: function(view, attr, error, selector) {
      console.log('invalid', attr, error);
      // compose the attr - for complex situations
      var arr = attr.split('.'),
        el = '';


      // TODO: editted here
      // for (var i = 0; i < arr.length; i++) {
      //   if (i === 0) el += arr[i];
      //   else el += '[' + arr[i] + ']';
      // }
      // always get the latest part of attr
      el = arr.length > 1 ? arr[1] : arr[0];

      var control, group, position, target;
      control = view.$('[' + selector + '="' + el + '"]');
      group = control.parents('.form-group');

      if(!group.hasClass('has-error'))
        group.addClass('has-error');

      if (control.data('error-style') === 'tooltip') {
        position = control.data('tooltip-position') || 'right';
        control.tooltip({
          placement: position,
          trigger: 'manual',
          title: error
        });
        return control.tooltip('show');
      } else if (control.data('error-style') === 'inline') {
        if (group.find('.help-inline').length === 0) {
          group.find('.col-md-5').append('<span class="help-inline error-message"></span>');
        }

        target = group.find('.help-inline');
        return target.text(error);
      } else {
        if (group.find('.help-block').length === 0) {
          group.find('.col-md-5').append('<p class="help-block error-message"></p>');
        }

        target = group.find('.help-block');
        if (error === 'Country cde is required')
          error = 'Country code is required'
        return target.text(error);
      }
    }
  });

  ///////////////////////////////////////////////////////////////////////////
  // Adding some more commonly used backbone validations
  console.log('Extending backbone validation');
  _.extend(Backbone.Validation.patterns, {

    variable_name: /^[a-zA-Z0-9_]*$/,

    us_dollar: /^(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?$/,

    //simple_url: /^((https?|ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
    simple_url: /(((http|ftp)s?:\/\/)|(\S+[\.\/]))\S*[^\s\.]*/,

    phone: /^(\([0-9]|[0-9])(\d{2}|\d{2}\))(-|.|\s)?\d{3}(-|.|\s)?\d{4}$/g,
    
    npi: /^\s*-?[0-9]{1,10}\s*$/

  });


  ///////////////////////////////////////////////////////////////////////////
  // Extends Handlerhars template
  ///////////////////////////////////////////////////////////////////////////

  (function() {
    var hbs = Handlebars;

    hbs.registerHelper('date', function(value) {
      var date = moment(value).calendar().split(' ')[0];
      if (date === 'Today')
        return date;
      else
        return moment(value).format('l');
    });

    hbs.registerHelper('time', function(value) {
      return moment("2013-039 " + value).format('LLL').split("2013 ")[1];
    });

    hbs.registerHelper('status', function(value) {
      if (value === 'c') {
        return 'Confirmed';
      } else if (value === 'p') {
        return 'Pending';
      } else if (value === 'x') {
        return 'Canceled';
      }

    });

    hbs.registerHelper('statusUI', function(status) {
      if (status === 'c')
        return 'text-success';
      if (status === 'x')
        return 'text-danger';
    });

    hbs.registerHelper('totalApt', function(v1, v2) {
      return Number(v1) + Number(v2);
    });

    hbs.registerHelper('checkIns', function(val) {
      val = Number(val);
      if (val > 0)
        return '-$' + val;
      else
        return '$' + val;
    });

    hbs.registerHelper('checkAvatar32', function(url, gender) {
      if (url)
        return url;
      else {
        if (gender === 'M')
          return '/images/user-avatar/Avatar-Male32x32.png';
        else
          return '/images/user-avatar/Avatar-Female32x32.png';
      }
    });

    hbs.registerHelper('checkAvatar65', function(url, gender) {
      if (url)
        return url;
      else {
        if (gender === 'M')
          return '/images/user-avatar/Avatar-Male65x65.png';
        else
          return '/images/user-avatar/Avatar-Female65x65.png';
      }
    });

    hbs.registerHelper('checkAvatar120', function(url, gender) {
      if (url)
        return url;
      else {
        if (gender === 'M')
          return '/images/user-avatar/Avatar-Male120x120.png';
        else
          return '/images/user-avatar/Avatar-Female120x120.png';
      }
    });

    hbs.registerHelper('genderYearOld', function(gender, yearsOld) {
      var currentYear = (new Date).getFullYear();
      yearsOld = yearsOld.split('-')[0];

      if (gender === 'M')
        return ['Male, ', Number(currentYear) - Number(yearsOld)].join('');
      if (gender === 'F')
        return ['Female, ', Number(currentYear) - Number(yearsOld)].join('');
    });

    hbs.registerHelper('convertTimeFormat', function(time) {
      return moment(time).format('L');
    });

    hbs.registerHelper('checkSelectedChosen', function(name, timezone) {
      if (name === timezone)
        return 'selected';
    });

    hbs.registerHelper('convertTimeDate', function(date, time) {
      var date = m.tz(date + ' ' + time, conf.timezone).format();
      var localTime = moment(date).zone(date);
      return moment(localTime._d).format('L');
      // localTime = moment(localTime._d).format('L');
      // if (localTime[0] === 'Last' || localTime[0] === 'Next')
      //   return localTime[0] + ' ' + localTime[1];
      // else
      //   return localTime[0];
    });

    hbs.registerHelper('convertTimeHour', function(date, time, A, duration, startTime) {
      var dateTime = m.tz(date + ' ' + time, conf.timezone).format();
      var localTime = moment(dateTime).zone(dateTime);
      if (A) {
        if (duration) {
          var stTime  = m.tz(date + ' ' + startTime, conf.timezone).format();
          stTime = moment(stTime).zone(stTime);

          var endTime = moment(stTime._d).add(Number(duration)/60, 'hour').format('h:mm A');
          return endTime;
        } else {
          return moment(localTime._d).format('h:mm A');
        }
      }
      else
        return moment(localTime._d).format('h:mm a');
    });

    hbs.registerHelper('checkMulChosen', function(id, arr) {
      var i = 0,
          len = 0;

      if(arr) {
        len = arr.length;
      }
      for (i; i < len; i++) {
        if (id === arr[i].speciality_id)
          return 'selected';
      }
    });

    hbs.registerHelper('convertNumb', function(num) {
      return Number(num);
    });

    hbs.registerHelper('cutText', function(txt) {
      if (txt) {
        txt = txt.replace(conf.regex, "");
        var entityRegex = /&[a-zA-Z0-9_]+;/i;
        txt = txt.replace(entityRegex,"");
        var len = txt.length;
        if (len <= 345) {
          return txt;
        } else {
          return txt.substring(0, 345) + '...'; 
        }
      }
    });

    hbs.registerHelper('convertLicenseName', function(type, index) {
      var i = 0,
          len = gon.license_type_cdes.length;
      for (i; i < len; i++) {
        if (type === gon.license_type_cdes[i].abbreviation_id) {
          if (index === 0)
            return gon.license_type_cdes[i].name;
          else
            return ', ' + gon.license_type_cdes[i].name;
          break;
        }
      }
    });

    hbs.registerHelper('convertInsuranceName', function(id, index) {
      var i = 0,
          len = gon.insurance_payers_names.length;

      id = Number(id);
      if (index === 3) {
        return ', ...'
      } else if (index < 3) {
        for (i; i < len; i++) {
          if (id === gon.insurance_payers_names[i].id) {
            if (index === 0) {
              return gon.insurance_payers_names[i].payers_name;
            } else {
              return ', ' + gon.insurance_payers_names[i].payers_name;
            }
            break;
          }
        }
      }
    });

    hbs.registerHelper('convertYoutube', function(url) {
      // conf.videoUrl();
      var youtubeUrl = url.match(/(watch)/i),
          youtubeEmbedUrl = url.match(/(embed)/i);
      if (youtubeUrl || youtubeEmbedUrl) {
        url = url.split('watch?v=');
        url = url[1];
        return "http://www.youtube.com/embed/" + url;
      } else {
        return url;
      }
    });

    hbs.registerHelper('checkMulInsurances', function(id, arr) {
      var i = 0,
          len = arr.length;
      for (i; i < len; i++) {
        if (id === Number(arr[i].insurance_payer_id))
          return 'selected';
      }
    });

    hbs.registerHelper('checkMulLang', function(id, arr) {
      var i = 0,
          len = arr.length;
      for (i; i < len; i++) {
        if (id === arr[i].language_cde)
          return 'selected';
      }
    });

    hbs.registerHelper('checkCheckbox', function(val) {
      if (val === 1 || val === '1' || val === 'Y')
        return 'checked';
    });

    hbs.registerHelper('checkChosenGender', function(val, gender) {
      if (val === gender)
        return 'selected';
    });

    hbs.registerHelper('convertAmount', function(val) {
      return val/100;
    });

    hbs.registerHelper('convertCPT', function(val) {
      if (val) {
        val = val.split(',');
        return val.join(', ');
      }
    });

    hbs.registerHelper('authDate', function(times) {
      return moment(times).format('ll');
    });

    hbs.registerHelper('showUIStatus', function(status) {
      if (status === 'c') {
        return 'icon-check text-success';
      } else if (status === 'p') {
        return 'icon-clock2';
      } else {
        return 'hi hi-remove text-danger';
      }
    });

    hbs.registerHelper('toString', function(val, field) {
      var string = [];
      _.each(val, function(item) {
        string.push(item[field]);
      });

      return string.join(',');
    });

    hbs.registerHelper('total', function(feeAmout, eia) {
      feeAmout = Number(feeAmout);
      eia = Number(eia);
      return feeAmout - eia;
    });

    hbs.registerHelper('gender', function(gender) {
      if (gender === 'M')
        return 'Male';
      else if (gender === 'F') {
        return 'Female'
      } else {
        return '';
      }
    });

    hbs.registerHelper('getTheFirstLiscense', function() {
      var licenseType = '',
        realArray = gon.therapist_license,
        defaulArray = gon.license_type_cdes;
        console.log('realArray', realArray);
        console.log('defaulArray', defaulArray);
        
      if(realArray.length > 0) {
        var idCode = realArray[0].license_type;

         _.each(defaulArray, function(item) {
            if (item.abbreviation_id === idCode) {
              licenseType = item.name;
            }
          });

        return licenseType;
      }
    });

  })();
  (function () {
    conf.applyValidateView = function (ViewType) {

      var prototype = ViewType.prototype;

      prototype.bindings || (prototype.bindings = {});

      prototype.bindings = _.reduce(prototype.bindings, function (memo, binding, idSelector) {
        // before updating model, should check validation first
        // see http://nytimes.github.io/backbone.stickit/#bindings/updatemodel
        if (typeof binding === 'string') {
          var bindingObj = {};
          bindingObj.observe = binding;
          bindingObj.updateModel = 'checkValidation';
          binding = bindingObj;
        }

        else {
          binding.updateModel = 'checkValidation';
        }

        memo[idSelector] = binding;
        return memo;
      }, {});

      prototype.checkValidation = function (val, e, options) {
        var
          $el = $(e.currentTarget),
          name = options.observe,
          view = options.view;

        // list of elements which are invalid
        view.invalidEls || (view.invalidEls = []);

        var errorMsg = this.model.preValidate(name, val);
        if (errorMsg) {
          $el.closest('.form-group').addClass('has-error');
          /*$el
            .tooltip('destroy')
            .tooltip({
              placement: 'top',
              title: errorMsg
            })
            .tooltip('show');*/
          $el.closest('.form-group').find('.error-message').text(errorMsg);

          // update list invalid elements
          view.invalidEls.push($el);
        }

        else {
          // prevent effect happen when removeClass .has-error
          /*$el.siblings('.tooltip').attr('style', 'display: none;');
          $el.tooltip('destroy');*/
          $el.closest('.form-group').removeClass('has-error');

          // remove the valid element from invalidEls array
          view.invalidEls = _.reject(view.invalidEls, function ($validEl) {
            return $validEl[0] === $el[0];
          });
        }

        // only update once without error message
        return _.isEmpty(errorMsg);
      };

      var oldOnSave = prototype.onSave;
      prototype.onSave = function () {
        this.invalidEls || (this.invalidEls = []);

        var isViewInvalid = this.invalidEls.length !== 0;

        // if don't valid should be focus on the first invalid element
        if (isViewInvalid) {
          this.invalidEls[0].focus();
          return;
        }

        oldOnSave.apply(this, [arguments]);
      };
    };
   
  })();
  
  conf.convertArray = function(string) {
    if (string) {
      var array = string.split(',');

      return array;
    }
  };

  conf.compareArraySpeciality = function() {

    var newArraySpeciality = [],
      realArray = gon.therapist_speciality,
      defaultArray = gon.speciality_cdes;
      
    _.each(realArray, function(ea) {
      var entry = _.find(defaultArray, function(eb) {
        if(ea.seq_speciality_cde === 0) {
          return ea.speciality_id == eb.speciality_id;
        }
      });
      if (entry) newArraySpeciality.push(entry);
    });
    return newArraySpeciality;
  };

  conf.compareArrayAdditionalExpertise = function() {

    var newAdditionalExpertise = [],
      realArray = gon.therapist_speciality,
      defaultArray = gon.speciality_cdes;
    _.each(realArray, function(ea) {
      var entry = _.find(defaultArray, function(eb) {
        if(ea.seq_speciality_cde === 9) {
          return ea.speciality_id == eb.speciality_id;
        }
      });
      if (entry) newAdditionalExpertise.push(entry);
    });
    return newAdditionalExpertise;
  };

  conf.compareArrayLanguage = function(realArray, defaultArray) {
    var newArrayLanguage = [];
    _.each(realArray, function(ea) {
      var entry = _.find(defaultArray, function(eb) {return ea.language_cde == eb.language_code;});
      if (entry) newArrayLanguage.push(entry);
    });
    return newArrayLanguage;
  };

  conf.slidingScale = function(value) {
    if (value === 'Y') {
      return true;
    } else {
      return false;
    }
  };

  conf.videoUrl = function(url) {
    if (url) {
      var bEmbed = url.indexOf('embed'),
          bWatch = url.indexOf('watch?v='),
          beShare = url.indexOf('youtu.be'),
          newVideo = '';

        if (bEmbed == -1) {
          if (bWatch !== -1) {
            
            newVideo = url.replace('watch?v=', 'embed/'); 
            return newVideo;
          }

          if(beShare !== -1) {
            newVideo = url.replace('youtu.be', 'www.youtube.com/embed');
            return newVideo;
          }
        }
    }
  };

  conf.insurance = function(realArray, defaultArray) {
    var insurancePlan = [];
    var uniqArray = _.uniq(realArray, function(item){
      
      return item.insurance_payer_id;
    });
    
    _.each(uniqArray, function(ea) {
        var entry = _.find(defaultArray, function(eb) {return ea.insurance_payer_id == eb.id.toString();});
        if (entry) insurancePlan.push(entry);
    });
    return insurancePlan;
  };

  conf.license = function(arr1, arr2, arr3) {
    //gon.therapist_license, gon.license_type_cdes,gon.state_cdes

    var licenseType = [],
      licenseState = [],
      arrResult = [];
    
    _.each(arr1, function(ea) {
        var entry = _.find(arr2, function(eb) {return ea.license_type == eb.abbreviation_id;});
        if (entry) licenseType.push(entry.name);
        // get licenseType
    });
    console.log('licenseType', licenseType);
    _.each(arr1, function(ea) {
        var entry = _.find(arr3, function(eb) {return ea.state == eb.abbreviation;});
        if (entry) licenseState.push(entry.name);
        //get licenseState
    });

    console.log('licenseState', licenseState);
    //return licenseType;
    _.each(arr1, function(item, index){
      var result1 = [licenseState[index], licenseType[index]].join(' '),
          result2 = [result1, item.license_number].join(' - ');

      arrResult.push(result2);
    });
    console.log('arrResult', arrResult);
    return arrResult;
  }
 
  return conf;
});