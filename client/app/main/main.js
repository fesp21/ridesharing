'use strict';

angular.module('rideSharingApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/:hash',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',

        resolve: {
          rideInfo: function($stateParams, liftagoService) {
            var hash = $stateParams.hash;
            return liftagoService.getRideInfo(hash);
          }
        },

      });
  });