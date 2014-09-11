'use strict';

angular.module('rideSharingApp')

  .constant('appConfig', {
    get: function(propertyName, defaultValue) {
      if (angular.isUndefined(window.globalConfig)) {
        window.location.reload(true);
      }

      if (window.globalConfig.hasOwnProperty(propertyName)) {
        return window.globalConfig[propertyName];
      }
      return defaultValue;
    }
  });