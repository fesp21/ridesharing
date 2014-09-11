'use strict';

angular.module('rideSharingApp')
  .controller('MainCtrl', function ($scope, $http, $locale, googleDirections, Geocoder, appConfig, rideInfo) {


    var getLatLonString = function(coords) {
      return coords.latitude + ',' + coords.longitude;
    }

    $scope.locale = $locale.id;

    //$scope.ride = rideInfo;
    var state = rideInfo.get('state');

    $scope.ride = {
      NEW: state == 'ARRIVING' || state == 'WAITING',
      POB: state == 'POB' && rideInfo.get('destination') && rideInfo.get('destination').lat,
      POB_NO_DEST: state == 'POB' && !rideInfo.get('destination'),
      DONE: state == 'FINISHED' || state == 'TIMEOUT',
    };

    $scope.passengerName = rideInfo.get('passengerInfo').firstName;

    $scope.map = {
      center: {
        latitude: rideInfo.get('pickup').lat,
        longitude: rideInfo.get('pickup').lon,
      },
      zoom: 14,
      options: {
        scrollwheel: false,
        draggable: true,
        //disableDefaultUI: true,
        //scaleControl: false,
        streetViewControl: false,
        //zoomControl: true,
        //rotateControl: false,
        panControl: false,
        mapTypeControl: false,
      }
    };

    $scope.markers = {
      pickup: {
        id: 1,
        coords: {
          latitude: rideInfo.get('pickup').lat,
          longitude: rideInfo.get('pickup').lon,
        },
        icon: 'assets/images/pin-a.png',
      },

      destination: {
        id: 1,
        coords: {
          latitude: rideInfo.get('destination').lat,
          longitude: rideInfo.get('destination').lon,
        },
        icon: 'assets/images/pin-b.png',
      },

      taxi: {
        id: 1,
        coords: {
          latitude: rideInfo.get('taxiPos').lat,
          longitude: rideInfo.get('taxiPos').lon,
        },
        icon: 'assets/images/pin-taxi.png',
      },

      options: {
        draggable: false,
      },
    };

    $scope.route = {
      id: 1,
      path: [
        $scope.markers.pickup.coords,
        $scope.markers.destination.coords,
      ],
      stroke: {
        color: '#16496F',
        weight: 3,
        opacity: 1,
      },
      visible: false,
      clickable: false,
      fit: true,
    };

    var args = {
      origin: getLatLonString($scope.markers.pickup.coords),
      waypoints: [{
        location: new google.maps.LatLng(
          $scope.markers.taxi.coords.latitude,
          $scope.markers.taxi.coords.longitude
        )
      }],
      destination: getLatLonString($scope.markers.destination.coords),
      travelMode: 'driving',
      unitSystem: 'metric',
      durationInTraffic: true,
    }


    googleDirections.getDirections(args).then(function(directions) {
      $scope.route.path = directions.routes[0].overview_path;
      $scope.route.visible = true;
      $scope.eta = Math.round(directions.routes[0].legs[1].duration.value / 60);
    });

    Geocoder.getLocation($scope.markers.destination.coords).then(function(location){
      if (location) {
        $scope.destinationPlaceName = location;
      }

    });

    var longAddress = rideInfo.get('destination').placeName.split(',');
    $scope.destinationPlaceName = longAddress[0];
    $scope.eta = '--';

    var lang = $locale.id.substr(0,2);
    $scope.liftagoLink = appConfig.get('web.url') + '/' + lang + '/app/install/taxi/' + rideInfo.get('passengerInfo').refcode + '+It+sms';
  });
