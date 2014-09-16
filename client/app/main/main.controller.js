'use strict';

angular.module('rideSharingApp')
  .controller('MainCtrl', function ($scope, $http, $log, $interval, $timeout, $locale, googleDirections, Geocoder, appConfig, liftagoService, rideInfo, rideHash) {
    var mapControl = {};

    var getMapBounds = function(latLgnBounds) {
      var
        ne = latLgnBounds.getNorthEast(),
        sw = latLgnBounds.getSouthWest();

      return {
        northeast: {
          latitude: ne.lat(),
          longitude: ne.lng(),
        },
        southwest: {
          latitude: sw.lat(),
          longitude: sw.lng(),
        }
      };

    }

    var getLatLonString = function(coords) {
      return coords.lat + ',' + coords.lon;
    };

    var getLatLng = function(coords) {
      return new google.maps.LatLng(coords.latitude, coords.longitude);
    }


    var updateRideInfo = function(ride) {
      var state = ride.get('state');

      $scope.state = state;

      $scope.ride.NEW = state == 'CREATED' || state == 'WAITING';
      $scope.ride.POB = state == 'POB' && ride.get('destination') && ride.get('destination').lat;
      $scope.ride.POB_NO_DEST = state == 'POB' && !ride.get('destination');
      $scope.ride.DONE = ride.isDone();

      // Do not show Taxi marker on a map iff Ride has Done.
      if (!$scope.ride.DONE) {
        $scope.markers.taxi.coords = {
          latitude: ride.get('taxiPos').lat,
          longitude: ride.get('taxiPos').lon,
        };
      }
    };

    /**
     * Uses #scope.markers to update the map bounds
     */
    var updateMapBounds = function() {
      var bounds = new google.maps.LatLngBounds();
      _($scope.markers).forEach(function(marker){
        if (marker.coords && marker.coords.latitude) {
          var coords = getLatLng(marker.coords);
          bounds.extend(coords);
        }
      });
      $scope.map.bounds = getMapBounds(bounds);

      $scope.map.center = {
        latitude: bounds.getCenter().lat(),
        longitude: bounds.getCenter().lng(),
      };
    }

    var updateRoute = function(ride) {
      if (!ride.get('destination')) return false;

      var directionsOptions = {
        origin: getLatLonString(ride.get('pickup')),
        destination: getLatLonString(ride.get('destination')),
        waypoints: [],
        travelMode: 'driving',
        unitSystem: 'metric',
        durationInTraffic: true,
      };

      if (ride.get('state') == 'POB' && ride.get('taxiPos')) {
        // Add Taxi marker on the Route from A to B.
        var taxiPos = ride.get('taxiPos');
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

    var updateInfoBoxHeight = function() {
      $timeout(function(){
        angular.element('#map_canvas').css('bottom', angular.element('#info_box').height() + 'px');
        //$log.debug('New InfoBox Height:', angular.element('#info_box').height());
      }, 100);
    }

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

      if (ride.get('destination').placeName) {
        var longAddress = ride.get('destination').placeName.split(',');
        $scope.destinationPlaceName = longAddress[0];
      }
    };


    // --- Initialize Scope Variables ---

    var lang = $locale.id.substr(0,2);
    lang = (lang === 'en') ? '' : '/' + lang;
    $scope.liftagoLink = appConfig.get('web.url') + lang + '/app/install/taxi/+' + rideInfo.get('refcode') + '+It+sms';

    $scope.eta = '–';

    $scope.ride = {};
    $scope.passengerName = rideInfo.get('passengerInfo').firstName;
    $scope.map = {
      center: {
        latitude: rideInfo.get('pickup').lat,
        longitude: rideInfo.get('pickup').lon,
      },
      zoom: 14,
      control: mapControl,
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

    // Only in case DESTINATION is known
    if (rideInfo.get('destination')) {
      $scope.markers.destination.coords = {
        latitude: rideInfo.get('destination').lat,
        longitude: rideInfo.get('destination').lon,
      };

      $scope.route.path = [
        $scope.markers.pickup.coords,
        $scope.markers.destination.coords,
      ];
    }



    updateRideInfo(rideInfo);
    updateMapBounds();
    updateRoute(rideInfo);
    updateDestinationPlaceName(rideInfo);
    updateInfoBoxHeight();


    var intervalRouteUpdater = $interval(function(){
      $log.debug('Interval updating Route.');
      updateRoute(rideInfo);
    }, 60000);

    $scope.$watch('state', function(state, oldState){
      if (state === oldState) return;

      $log.debug('Watcher updating Route.');
      updateRoute(rideInfo);

      // In final state show the taxi marker.
      if (oldState == 'POB') {
        $scope.markers.taxi.coords = {
          latitude: rideInfo.get('taxiPos').lat,
          longitude: rideInfo.get('taxiPos').lon,
        };
      }

      // Update Height of Map Canvas
      updateInfoBoxHeight();
    });


    liftagoService.getRideInfoPoller(rideHash).then(null, null, function(ride){
      // Update the rideInfo object first so that Interval and Watcher are ok with using rideInfo
      rideInfo = ride;

      updateRideInfo(ride);

      if (ride.isDone()) {
        $log.debug('Stopping Poller, Interval.');
        updateRoute(ride);

        liftagoService.stopPoller();
        $interval.cancel(intervalRouteUpdater);
      }
    });

  });
