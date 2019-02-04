var app = angular.module('MyApp', ['ngMaterial', 'ApiService'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .dark()
    .primaryPalette('green')
    .accentPalette('orange');
})
