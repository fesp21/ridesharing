'use strict';

angular.module('rideSharingApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'angulartics',
  'angulartics.google.analytics',
  'gettext',
  'geocoder',
  'tmh.dynamicLocale',
  'google-maps',
  'ui.router'
])

  .constant('supportedLanguages', [
    'en_US',
    'cs_CZ',
  ])

  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, tmhDynamicLocaleProvider) {

    tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js');

    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(false);

  })

  .run(function ($window, tmhDynamicLocale, supportedLanguages, gettextCatalog) {

    var
      lang = $window.session && $window.session.locale && $window.session.locale.lang,
      locale;
    if (lang) {
      locale = _(supportedLanguages).find(function (supLang) {
        return supLang.indexOf(lang) === 0;
      });
    }

    // Language is supported
    if (locale) {
      gettextCatalog.setCurrentLanguage(locale);
      tmhDynamicLocale.set(lang);
    }

  })
  ;