'use strict';

angular.module('rideSharingApp')
  .controller('MainCtrl', function ($scope, $http, $log, $locale, googleDirections, Geocoder, appConfig, liftagoService, rideInfo, rideHash) {

    var getLatLonString = function(coords) {
      return coords.lat + ',' + coords.lon;
    }

    var updateRideInfo = function(ride) {
      var state = rideInfo.get('state');

      $scope.ride.NEW = state == 'CREATED' || state == 'WAITING';
      $scope.ride.POB = state == 'POB' && rideInfo.get('destination') && rideInfo.get('destination').lat;
      $scope.ride.POB_NO_DEST = state == 'POB' && !rideInfo.get('destination');
      $scope.ride.DONE = state == 'FINISHED' || state == 'TIMEOUTED' || state == 'CANCELLED';

      // Do not show Taxi marker on a map iff Ride has Done.
      if (!$scope.ride.DONE) {
        $scope.markers.taxi.coords = {
          latitude: rideInfo.get('taxiPos').lat,
          longitude: rideInfo.get('taxiPos').lon,
        };
      }
    };

    var updateRoute = function(ride) {
      if (!rideInfo.get('destination')) return false;

      var directionsOptions = {
        origin: getLatLonString(rideInfo.get('pickup')),
        destination: getLatLonString(rideInfo.get('destination')),
        waypoints: [],
        travelMode: 'driving',
        unitSystem: 'metric',
        durationInTraffic: true,
      };

      if (rideInfo.get('state') == 'POB' && rideInfo.get('taxiPos')) {
        // Add Taxi marker on the Route from A to B.
        var taxiPos = rideInfo.get('taxiPos');
        directionsOptions.waypoints.push({
          location: new google.maps.LatLng(taxiPos.lat, taxiPos.lon)
        });
      }

      googleDirections.getDirections(directionsOptions).then(function(directions) {
        if (directions.routes.length) {
          var route = directions.routes[0];
          $scope.route.path = route.overview_path;
          $scope.route.visible = true;
          if (route.legs.length > 0) {
            $scope.eta = Math.round(route.legs[route.legs.length - 1].duration.value / 60);
          }
        }
      });
    };

    var updateDestinationPlaceName = function(ride) {
      if (!ride.get('destination')) return false;

      var destinationCoords = {
        latitude: ride.get('destination').lat,
        longitude: ride.get('destination').lon,
      };

      Geocoder.getLocation(destinationCoords).then(function(location){
        if (location) {
          $scope.destinationPlaceName = location;
        }
      });

      var longAddress = rideInfo.get('destination').placeName.split(',');
      $scope.destinationPlaceName = longAddress[0];
    };


    liftagoService.getRideInfoPoller(rideHash).then(null, null, function(ride){
      $log.debug('Yay! New ride data are here!', ride);
      updateRideInfo(ride);
    });



    // --- Initialize Scope Variables ---

    var lang = $locale.id.substr(0,2);
    $scope.liftagoLink = appConfig.get('web.url') + '/' + lang + '/app/install/taxi/' + rideInfo.get('passengerInfo').refcode + '+It+sms';

    $scope.eta = '–';

    $scope.ride = {};
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
        id: 2,
        coords: {
          latitude: rideInfo.get('destination').lat,
          longitude: rideInfo.get('destination').lon,
        },
        icon: 'assets/images/pin-b.png',
      },

      taxi: {
        id: 3,
        coords: {},
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

    updateRideInfo(rideInfo);
    updateRoute(rideInfo);
    updateDestinationPlaceName(rideInfo);
  });
