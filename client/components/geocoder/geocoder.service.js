/*
 * An AngularJS Service for intelligently geocoding addresses using Google's API. Makes use of
 * localStorage (via the ngStorage package) to avoid unnecessary trips to the server. Queries
 * Google's API synchronously to avoid `google.maps.GeocoderStatus.OVER_QUERY_LIMIT`.
 *
 * @author: benmj
 * @author: amir.valiani
 *
 * Original source: https://gist.github.com/benmj/6380466
 */

/*global angular: true, google: true, _ : true */

'use strict';

angular.module('geocoder', [
  'ngStorage'
])
  .factory('Geocoder', function ($localStorage, $log, $q, $timeout, $rootScope) {
  var locations = $localStorage.locations ? JSON.parse($localStorage.locations) : {};

  var queue = [];

  // Amount of time (in milliseconds) to pause between each trip to the
  // Geocoding API, which places limits on frequency.
  var QUERY_PAUSE= 250;

  /**
   * executeNext() - execute the next function in the queue.
   *                  If a result is returned, fulfill the promise.
   *                  If we get an error, reject the promise (with message).
   *                  If we receive OVER_QUERY_LIMIT, increase interval and try again.
   */
  var executeNext = function () {
    var task = queue[0],
      geocoder = new google.maps.Geocoder();

    geocoder.geocode({
        address : task.address,
        componentRestrictions: angular.isDefined(task.country) ? {country: task.country} : {}
      },
      function (result, status) {

      if (status === google.maps.GeocoderStatus.OK) {

        var parsedResult = result[0];
        parsedResult.lat = result[0].geometry.location.lat();
        parsedResult.lng = result[0].geometry.location.lng();

        locations[task.address + task.country] = parsedResult;

        $log.debug('task + result', task, parsedResult);

        $localStorage.locations = JSON.stringify(locations);

        queue.shift();
        task.d.resolve(parsedResult);

      } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
        queue.shift();
        task.d.reject({
          type: 'zero',
          message: 'Zero results for geocoding address ' + task.address
        });
      } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
        if (task.executedAfterPause) {
          queue.shift();
          task.d.reject({
            type: 'busy',
            message: 'Geocoding server is busy can not process address ' + task.address
          });
        }
      } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
        queue.shift();
        task.d.reject({
          type: 'denied',
          message: 'Request denied for geocoding address ' + task.address
        });
      } else {
        queue.shift();
        task.d.reject({
          type: 'invalid',
          message: 'Invalid request for geocoding: status=' + status + ', address=' + task.address
        });
      }

      if (queue.length) {
        if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
          var nextTask = queue[0];
          nextTask.executedAfterPause = true;
          $timeout(executeNext, QUERY_PAUSE);
        } else {
          $timeout(executeNext, 0);
        }
      }

      if (!$rootScope.$$phase) { $rootScope.$apply(); }
    });
  };

  return {
    geocodeAddress : function (address, country) {
      var d = $q.defer();

      if (_.has(locations, address+country)) {
        d.resolve(locations[address+country]);
      } else {
        var task = {
          address: address,
          d: d
        };
        if (angular.isDefined(country)) {
          task.country = country;
        }
        queue.push(task);

        if (queue.length === 1) {
          executeNext();
        }
      }

      return d.promise;
    },

    getLocation: function(coords) {
      var _this = this;
      var defer = $q.defer();
      var geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(coords.latitude, coords.longitude);
      geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          $log.debug('Geocoded:', results);

          var found;
          _.forEach(results, function(result){
            found = _this.findShortPlaceName(result);
            if (found) return false; // break forEach
          });
          $log.debug('Geocoded found:', found);
          defer.resolve(found);
        } else {
          $log.debug('Geocoder error:', status);
          defer.reject(status);
        }
      });

      return defer.promise;
    },

    findShortPlaceName: function(locationObject) {
      var result = {};
      _.forEach(locationObject.address_components, function(component){
        if (_.indexOf(component.types, 'route') > -1) {
          result.street = component.short_name;
        }
        else if (_.indexOf(component.types, 'street') > -1) {
          result.street = component.short_name;
        }

        if (_.indexOf(component.types, 'street_number') > -1) {
          result.number = component.short_name;
        }
      });

      if (result.street && result.number) {
        return result.street + ' ' + result.number;
      }

      return false;
    }
  };
});
