'use strict';

angular.module('rideSharingApp')
  .factory('liftagoService', function ($q, $timeout, $resource, $http, $log, poller, appConfig, Ride) {

    var baseUrl = appConfig.get('api.url').trim('/') + '/';

    var errorHandler = function(e) {
      $log.error('Liftago API error', e);
      throw e;
    };

    function httpGet(endpoint, params) {
      var conf = {
        url: baseUrl  + endpoint,
        type: 'GET',
      };

      if (params) {
        conf.params = params;
      }
      //return $http(conf);
      return fakeGet();
    }

    var fakeGet = function() {
      var defer = $q.defer();
      $timeout(function(){
        defer.resolve({
          status: 200,
          data: {
            data: mockRide
          },
          mock: true
        })
      }, 100);

      return defer.promise;
    };

    var getRidePoller = function(rideHash) {
      var resource = $resource(baseUrl + 'rideInfoShare/:hash/', {hash: rideHash}, {
        query: {
          method: 'GET',
          isArray: false
        }
      });

      return poller.get(resource, {
        action: 'query',
        delay: 10000,
        smart: true
      });
    };


    var preprocessRideResult = function(response) {
      $log.debug('RideInfo:', response.data);
      return new Ride(response.data);
    };

    var ridePollerPromise;


    // Public API here
    return {

      stopPoller: function() {
        poller.stopAll();
      },

      getRideInfoPoller: function(rideHash) {
        // Init poller
        if (!ridePollerPromise) {
          ridePollerPromise = getRidePoller(rideHash).promise.then(null, null, preprocessRideResult);
        }
        return ridePollerPromise;
      },

      getRideInfo: function(rideHash) {
        return httpGet('rideInfoShare/' + rideHash).then(function(response) {
          if (response.status === 204) {
            return false;
          }

          $log.debug('RideInfo:', response.data);
          return new Ride(response.data.data);
        }).catch(errorHandler);
      },

    };
  });
