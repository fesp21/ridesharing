'use strict';

angular.module('rideSharingApp')
  .factory('PropertyModel', function PropertyModelFactory($log) {
    var PropertyModel;
    return PropertyModel = (function() {
      PropertyModel.defaults = function() {
        return angular.copy({});
      };

      function PropertyModel(properties) {
        this.update(properties);
      }

      // Children should put special get_* and set_* methods into this object.
      PropertyModel.prototype.accessors = {};

      PropertyModel.prototype.get = function(propName) {
        return this._getOrCallProperty(propName);
      };

      PropertyModel.prototype.set = function() {
        var __slice = [].slice;
        var propName, setterMethod, values;
        propName = arguments[0], values = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        setterMethod = this.accessors["set_" + propName];
        if (setterMethod != null) {
          return setterMethod.apply(this, values);
        } else {
          if (values.length > 1) {
            throw "Cannot provide multiple values for a singular property";
          }
          return this.properties[propName] = values[0];
        }
      };

      PropertyModel.prototype.update = function(properties) {
        var defaults, _base, _ref;
        if (properties == null) {
          properties = {};
        }
        if (!angular.isObject(properties)) {
          throw "'" + ((_ref = this.constructor) != null ? _ref.name : void 0) + "' properties must be contructed with an object '{}'";
        }
        this.properties = this.properties || {};
        if (!_.isEqual(angular.copy(this.properties), properties)) {
          defaults = (typeof (_base = this.constructor).defaults === "function" ? _base.defaults() : void 0) || {};
          return this.properties = _.extend(defaults, properties);
        }
      };

      PropertyModel.prototype._getOrCallProperty = function(propName) {
        var readerMethod, _ref, _ref1;
        readerMethod = (_ref = this.accessors) != null ? _ref["get_" + propName] : void 0;
        if (readerMethod != null) {
          return readerMethod.apply(this);
        } else if (this.properties.hasOwnProperty(propName)) {
          return this.properties[propName];
        } else {
          $log.error("PropertyNotFound: '" + propName + "' on " + ((_ref1 = this.constructor) != null ? _ref1.name : void 0) + " Model");
          return null;
        }
      };

      return PropertyModel;

    })();
  });
