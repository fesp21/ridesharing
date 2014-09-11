'use strict';

angular.module('rideSharingApp')
  .factory('liftagoService', function ($q, $timeout, $http, $log, appConfig, Ride) {

    var mockRide = {
      "pickupArrivalAt":"2014-09-03T19:38:01.060Z",
      "taxiPos":{ // Palo fake
        "lat": 50.077175,
        "lon": 14.440993,
        "placeName":null,
      },
      "state":"POB",
      "taxiInfo":{
        "firstName":"Drson",
        "car":{
          "brand":"Chevrolet",
          "colorId":8,
          "model":"Orlando",
        },
      },
      "orderedAt":"2014-09-03T19:32:56.356Z",
      "arrivalPeriod":180,
      "finishedAt":"2014-09-03T19:47:57.537Z",
      "startRideAt":"2014-09-03T19:38:04.852Z",
      "passengerInfo":{
        "firstName":"Marlohe",
        "refcode":"+12345"
      },
      "taxiId":"800002542",
      "canceledAt":null,
      "destination":{
        "lat": 50.071437,
        "lon": 14.414340,
        "placeName":"Rašínovo nábřeží 58, 128 00 Praha 2, Czech Republic",
      },
      "estimatedPrice":{
        "amount":"138.8477763152979",
        "ccy":"CZK"
      },
      "pickup":{
        "lat": 50.082564,
        "lon": 14.455625,
        "placeName":"Táboritská 580/20, 130 00 Praha, Czech Republic",
      },
      "dropOffPosition":{ // Palo fake
        "lat": 50.082564,
        "lon": 14.455625,
        "placeName":"Táboritská 580/20, 130 00 Praha, Czech Republic",
      },
      "passengerPos":{
        "lat": 50.082564,
        "lon": 14.455625,
        "placeName":null,
      },
    };

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
    }

    // Public API here
    return {

      getRideInfo: function(rideHash) {
        return httpGet('rideSharingInfo/' + rideHash).then(function(response){
          if (response.status === 204) {
            return false;
          }

          $log.debug('RideInfo:', response.data);
          return new Ride(response.data.data);
        }).catch(errorHandler);
      },

    };
  });
