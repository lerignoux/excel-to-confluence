(function () {

  'use strict';

  angular.module('MyApp').controller('MainController', ['$scope', '$mdToast', '$templateRequest', '$sce', '$timeout', 'ConfluenceService',
    function($scope, $mdToast, $templateRequest, $sce, $timeout, ApiService) {

      $scope.ApiService = ApiService;
      $scope.workbook = null;
      $scope.data = null;
      $scope.sheets = [];

      $scope.excel = {
        sheet: null,
        columns: []
      }

      $scope.confluence = {
        pageId: null,
        pageTitle: null,
        header: ""
      }

      $scope.loading = 0;


      $scope.templatesLoaded = function(){
        if ($scope.confluence.confluenceTemplate && !$scope.templates.confluence) {return false;}
        if ($scope.confluence.headerTemplate && !$scope.templates.header) {return false;}
        if ($scope.confluence.tableSectionTemplate && !$scope.templates.tableSection) {return false;}
        return true;
      }

      $scope.onOver = function(e) {
       angular.element(e.target).addClass("hover");
      };

      $scope.onOut = function(e) {
        angular.element(e.target).removeClass("hover");
      };

      $scope.goto = function(page) {
        $scope.mode = page;
      };

      $scope.cancel = function(e) {
        if (e.preventDefault) { e.preventDefault(); }
        return false;
      }

      $scope.handleDrop = function(e) {
        $scope.loading += 1;
        var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
        e.stopPropagation();
        e.preventDefault();
        $scope.filename = e.dataTransfer.files[0].name;
        var file = e.dataTransfer.files, f = files[0];
        ApiService.post_data("excel", ev, {'file': file})
        $scope.loading -= 1;
      }

      document.getElementById('dropArea').addEventListener('drop', $scope.handleDrop, false);
      document.getElementById('dropArea').addEventListener("dragover", function( event ) {
        // prevent default to allow drop
        event.preventDefault();
      }, false);
      document.getElementById('dropArea').addEventListener("dragenter", function( event ) {
        $scope.hovering = true;
        $scope.$apply();
        $timeout(function() {$scope.hovering = false; $scope.$apply();}, 3000);
      }, false);

      $scope.selectSheet = function() {
        $scope.sheets = Object.keys(config[$scope.filename]);
        if(config[$scope.filename] !== undefined) {
          $scope.excel.sheet = $scope.sheets[0]
          $scope.handleExcelFile();

      }

      $scope.selectColumns = function() {
        $scope.sheets = Object.keys(config[$scope.filename]);
        if(config[$scope.filename] !== undefined) {
          $scope.excel.sheet = $scope.sheets[0]
          $scope.handleExcelFile();
      }

      $scope.updateConfluencePage = function(ev) {
        ApiService.post_data("confluence", ev, {'data': $scope.confluence.pageData, 'page_id': $scope.confluence.pageId, 'page_title': $scope.confluence.pageTitle})
      }

      $scope.showErrorToast = function(message) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .position('bottom center')
            .hideDelay(10000)
            .theme("failure-toast")
        );
      };

      $scope.showSuccessToast = function(message) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .position('bottom center')
            .hideDelay(3000)
            .theme("success-toast")
        );
      };

    }
  ]);
}());
