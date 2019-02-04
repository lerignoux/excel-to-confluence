(function () {

  'use strict';

  angular.module('MyApp').controller('MainController', ['$scope', '$mdToast', '$templateRequest', '$sce', '$timeout', 'ApiService',
    function($scope, $mdToast, $templateRequest, $sce, $timeout, ApiService) {

      $scope.ApiService = ApiService;
      $scope.workbook = null;
      $scope.data = null;
      $scope.sheets = [];

      $scope.excel = {
        sheets: [],
        sheet: undefined,
        headerRow: undefined,
      }

      $scope.confluence = {
        pageId: undefined,
        pageTitle: undefined,
        header: ""
      }

      $scope.loading = 0;

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
        $scope.file = e.dataTransfer.files[0];
        $scope.checkWorkbook();
        $scope.loading -= 1;
      }

      $scope.checkWorkbook = function() {
        var conf = {
        }
        if ($scope.excel.sheet !== undefined){
          conf.sheet = $scope.excel.sheet
        }
        if ($scope.excel.header_row !== undefined){
          conf.header_row = $scope.excel.header_row
        }
        ApiService.post_file("excel", $scope.file, conf, function(data) {
          $scope.excel.sheets = data.sheets;
          $scope.excel.header_row = data.header_row
          $scope.data = data.data;
          $scope.confluence.source = data.source;
        })
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

      $scope.confluenceUpload = function(ev) {
        $scope.ApiService.post("confluence", ev, {'data': $scope.data, 'page_id': $scope.confluence.pageId, 'page_title': $scope.confluence.pageTitle})
      }

      $scope.showErrorToast = function(message) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .position('bottom center')
            .hideDelay(10000)
            .theme("failure-toast")
        );
      }

      $scope.showSuccessToast = function(message) {
        $mdToast.show(
          $mdToast.simple()
            .textContent(message)
            .position('bottom center')
            .hideDelay(3000)
            .theme("success-toast")
        );
      }

    }
  ]);
}());
