var app = angular.module('MyApp', ['ngMaterial', 'ConfluenceService'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .dark()
    .primaryPalette('green')
    .accentPalette('orange');
})
