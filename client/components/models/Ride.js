'use strict';

angular.module('rideSharingApp')
  .factory('Ride', function RideFactory(PropertyModel) {

    var carColors = ['black', 'blue', 'brown', 'green', 'orange', 'purple', 'red', 'silver', 'white', 'yellow'];

    function Ride(properties) {
      PropertyModel.call(this, properties);
    };

    Ride.prototype = Object.create(PropertyModel.prototype);

    Ride.prototype.accessors = {
      get_dropOff: function () {
        return this.properties.dropOffPos && this.properties.dropOffPos.location || this.properties.destination;
      },
      get_destination: function () {
        if (this.isDone() && this.properties.dropOffPos && this.properties.dropOffPos.location) {
          return this.properties.dropOffPos.location;
        }
        return this.properties.destination;
      },
      get_taxiPos: function () {
        return this.properties.taxiPos && this.properties.taxiPos.location;
      },
      get_refcode: function() {
        return this.properties.passengerInfo && this.properties.passengerInfo.referralCode;
      }
    };

    Ride.prototype.isDone = function() {
      var state = this.properties.state;
      return state == 'FINISHED' || state == 'TIMEOUTED' || state == 'CANCELLED'
    };

    return Ride;
  });