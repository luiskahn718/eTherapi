define([
  'collections/base',
  'models/patient/insurance-model'
], function(Collection, Insurancemodel) {
  'use strict';

  var InsuranceCollection = Collection.extend({
    model: Insurancemodel
  });

  return InsuranceCollection;
});