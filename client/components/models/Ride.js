'use strict';

angular.module('rideSharingApp')
  .factory('Ride', function RideFactory(PropertyModel) {

    var carColors = ['black', 'blue', 'brown', 'green', 'orange', 'purple', 'red', 'silver', 'white', 'yellow'];

    function Ride(properties) {
      PropertyModel.call(this, properties);
    };

    Ride.prototype = Object.create(PropertyModel.prototype);

    Ride.prototype.accessors = {
      get_destination: function () {
        return this.properties.destination || this.properties.dropOffPosition;
      },
      get_refcode: function() {
        return this.properties.refCode;
      }
    };

    Ride.prototype.isDone = function() {
      var state = this.properties.state;
      return state == 'FINISHED' || state == 'TIMEOUTED' || state == 'CANCELLED'
    };

    return Ride;
  });