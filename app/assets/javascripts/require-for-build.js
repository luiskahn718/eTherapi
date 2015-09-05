require.config({
  paths: {
    "backbone": "../../../vendor/assets/components/backbone-amd/backbone",
    "jquery": "../../../vendor/assets/components/jquery/dist/jquery",
    "underscore": "../../../vendor/assets/components/underscore-amd/underscore",
    "backbone.babysitter": "../../../vendor/assets/components/backbone.babysitter/lib/backbone.babysitter",
    "backbone.wreqr": "../../../vendor/assets/components/backbone.wreqr/lib/backbone.wreqr",
    "marionette": "../../../vendor/assets/components/backbone.marionette/lib/core/amd/backbone.marionette",
    "text": "../../../vendor/assets/components/requirejs-text/text",
    "hbs": "../../../vendor/assets/vendor/hbs",
    "handlebars": "../../../vendor/assets/components/require-handlebars-plugin/Handlebars",
    "bootstrap": "../../../vendor/assets/components/bootstrap/dist/js/bootstrap",
    "dom-ready": "../../../vendor/assets/components/requirejs-domready/domReady",
    "backbone-route-filter": "../../../vendor/assets/components/backbone-route-filter/backbone-route-filter",
    "backbone-eventbroker": "../../../vendor/assets/vendor/backbone-eventbroker",
    "backbone-validation": "../../../vendor/assets/components/backbone-validation/dist/backbone-validation-amd",
    "stickit": "../../../vendor/assets/components/backbone.stickit/backbone.stickit",
    "moment": "../../../vendor/assets/components/moment/moment",
    "moment-timezone": "../../../vendor/assets/components/moment-timezone/builds/moment-timezone-with-data",
    "tags-input": "../../../vendor/assets/vendor/bootstrap-tagsinput",
    "jstz": "../../../vendor/assets/vendor/jstz",
    "clock": "../../../vendor/assets/vendor/jquery.clock",
    "datepicker": "../../../vendor/assets/components/bootstrap-datepicker/js/bootstrap-datepicker",
    // 'bootstrap.wysihtml5': "../../../vendor/assets/components/bootstrap3-wysihtml5-bower/dist/bootstrap3-wysihtml5.all",
    // 'bootstrap.wysihtml5.de-DE': "../../../vendor/assets/components/bootstrap3-wysihtml5-bower/dist/locales/bootstrap-wysihtml5.de-DE",
    // 'rangy': "../../../vendor/assets/components/rangy-1.3/rangy-core",
    // 'wysihtml5': "../../../vendor/assets/components/bootstrap3-wysihtml5-bower/dist/amd/wysihtml5",
    // 'bootstrap.wysihtml5.templates': "../../../vendor/assets/components/bootstrap3-wysihtml5-bower/dist/amd/templates",
    // 'bootstrap.wysihtml5.commands': "../../../vendor/assets/components/bootstrap3-wysihtml5-bower/dist/amd/commands",
    // 'handlebars.runtime': "../../../vendor/assets/components/bootstrap3-wysihtml5-bower/dist/amd//handlebars.runtime.amd",
    // "bootstrap.wysihtml5": ""


    // 'handlebars2': "handlebars2",
    'bootstrap-wysihtml5': "../../../vendor/assets/vendor/bootstrap-wysihtml5",
    "chosen": "../../../vendor/assets/components/chosen_v1.1.0/chosen.jquery",
    "typeahead": "../../../vendor/assets/vendor/typeahead",
    "bundle": "../../../vendor/assets/components/typeahead.js/dist/typeahead.bundle",
    "maskedInput": "../../../vendor/assets/components/jquery-maskedinput/dist/jquery.maskedinput",
    "crop": "../../../vendor/assets/vendor/crop",
    "purl": "../../../vendor/assets/components/purl/purl",
    "aniHeader": "../../../vendor/assets/vendor/AniHeader.min",
    "parallax": "../../../vendor/assets/vendor/jquery.parallax-1.1.3",
    "localscroll": "../../../vendor/assets/vendor/jquery.localscroll-1.2.7-min",
    "scrollTo": "../../../vendor/assets/vendor/jquery.scrollTo-1.4.2-min",
    "jquery-ui": "../../../vendor/assets/vendor/jquery-ui",
    "fullcalendar": "../../../vendor/assets/components/fullcalendar/dist/fullcalendar",
    "placeholders": "../../../vendor/assets/vendor/placeholders.min",
  },

  shim: {
    "jquery": {
      exports: "$"
    },
    "underscore": {
      exports: "_"
    },
    "bootstrap": {
      deps: [
        "jquery"
      ]
    },
    "datepicker": {
      deps: [
        "jquery"
      ]
    },
    "classie": {
      deps: [
        "jquery"
      ]
    },
    "aniHeader": {
      deps: [
        "jquery"
      ]
    },
    "parallax": {
      deps: [
        "jquery"
      ]
    },
    "localscroll": {
      deps: [
        "jquery"
      ]
    },
    "scrollTo": {
      deps: [
        "jquery"
      ]
    },
    "chosen": {
      deps: [
        "jquery"
      ]
    },
    "typeahead": {
      deps: [
        "jquery"
      ]
    },
    "bundle": {
      deps: [
        "jquery"
      ]
    },
    "maskedInput": {
      deps: [
        "jquery"
      ]
    },
    "backbone": {
      deps: [
        "jquery",
        "underscore"
      ],
      exports: "Backbone"
    },
    "backbone.babysitter": {
      deps: [
        "backbone"
      ]
    },
    "backbone.wreqr": {
      deps: [
        "backbone"
      ]
    },
    "marionette": {
      deps: [
        "backbone",
        "backbone.babysitter",
        "backbone.wreqr"
      ],
      exports: "Marionette"
    },
    "backbone-route-filter": {
      deps: [
        "backbone"
      ]
    },
    "backbone-eventbroker": {
      deps: [
        "backbone"
      ]
    },
    "backbone-validation": {
      deps: [
        "backbone"
      ]
    },
    "stickit": {
      deps: [
        "jquery",
        "backbone"
      ]
    },
    "tags-input": {
      deps: [
        "jquery"
      ]
    },
    "crop": {
      deps: [
        "jquery"
      ]
    }
  }
});

require([
  'dom-ready',
  'underscore',
  'handlebars',
  'jquery',
  'bootstrap',
  'backbone',
  'marionette',
  'backbone-route-filter'
], function (domReady, _, hbs) {
  'use strict';
  window.handlebarsTpl = hbs;

  // console.log(window.handlebarsTpl);
  // console.log(Handlebars);

  function runApp() {
    require(['routes/routers'], function(app) {
      app.run();
    });
  }

  domReady(function() {
    runApp();
  });

});