/**
 * This is Ajax api helper.
 */
define([
  'jquery'
], function($) {
  'use strict';

  /**
   * Ajax wrapper
   *
   * @param {string}    method of request: POST, GET, PUT, DELETE, PATCH or HEAD
   * @param {string}    url The url of request
   * @param {object}    data The data for request [optional]
   * @param {function}  callback The callback method for request [optional]
   */
  var ajax = function (method, url, data, callback) {

    // detect if data is function
    // so it will callback & data is empty
    if (typeof data === 'function') {
      callback = data;
      data = {};
    }

    // format JSON data to string
    data = data ? JSON.stringify(data) : null;

    var params = {
      type: method,
      url: url,
      data: data,
      dataType: 'json',
      beforeSend: function(xhr, settings) {
        // TODO: some 
      }
    };

    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      params.contentType = 'application/json';
    }

    return $.ajax(params).success(function(res) {
      callback && callback(null, res);
    }).error(function(res) {
      callback && callback(res);
    });
  };

  // Expose apis
  return {
    post: function (url, data, callback) {
      console.log(data);
      return ajax('POST', url, data, callback);
    },

    put: function (url, data, callback) {
      return ajax('PUT', url, data, callback);
    },

    get: function (url, callback) {
      return ajax('GET', url, '', callback);
    },

    del: function (url, data, callback) {
      return ajax('DELETE', url, data, callback);
    }
  };
});