'use strict';

angular.module('rideSharingApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/:hash',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',

        resolve: {
          rideHash: function($q, $stateParams) {
            if ($stateParams.hash) {
              return $stateParams.hash;
            }

            // Wait forever... by returning never-resolved promise.
            return $q.defer().promise;
          },
          /**
           * We need at least the first Ride Info response to init controller
           *
           * @returns {promise} Promise of first RideInfo result
           */
          rideInfo: function($q, rideHash, liftagoService) {
            var defer = $q.defer();
            var rideInfoPromise = liftagoService.getRideInfoPoller(rideHash);
            rideInfoPromise.then(null, null, function(result){
              defer.resolve(result);
            });
            return defer.promise;
          }
        },

      });
  });