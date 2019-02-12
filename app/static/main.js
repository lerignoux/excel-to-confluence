var app = angular.module('MyApp', ['ngMaterial', 'ngCookies', 'ApiService', 'ConfluenceService'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .dark()
    .primaryPalette('green')
    .accentPalette('orange');
})
