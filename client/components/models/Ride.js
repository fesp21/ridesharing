'use strict';

angular.module('rideSharingApp')
  .factory('Ride', function RideFactory(PropertyModel) {

    var carColors = ['black', 'blue', 'brown', 'green', 'orange', 'purple', 'red', 'silver', 'white', 'yellow'];

    function Ride(properties) {
      PropertyModel.call(this, properties);
    };

    Ride.prototype = Object.create(PropertyModel.prototype);

    Ride.prototype.accessors = {
      get_colorName: function () {
        return carColors[this.properties.colorId];
      },
      get_fullName: function () {
        return this.properties.brand + ' ' + this.properties.model;
      },
      get_imageFront: function () {
        var uuid = null;
        _(this.properties.images).forEach(function (image) {
          if (image.key == 'RideFront' && image.image && image.image.uuid) {
            uuid = image.image.uuid;
            return false; // break forEach
          }
        });
        return uuid;
      }
    };

      return Ride;
  });