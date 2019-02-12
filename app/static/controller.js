(function () {

  'use strict';

  angular.module('MyApp').controller('MainController', ['$scope', '$mdToast', '$templateRequest', '$sce', '$timeout', 'ApiService', 'ConfluenceService',
    function($scope, $mdToast, $templateRequest, $sce, $timeout, ApiService, ConfluenceService) {

      $scope.ApiService = ApiService;
      $scope.ConfluenceService = ConfluenceService;

      $scope.confluenceMode = 'upload';
      $scope.loading = 0;

      $scope.data = undefined;
      $scope.excel = {
        sheets: [],
        sheet: undefined
      }
      $scope.confluence = {
        pageId: undefined,
        pageTitle: undefined,
        header: ""
      }

      $scope.busy = function(){
        return $scope.ApiService.loading + $scope.ConfluenceService.loading + $scope.loading;
      }

      $scope.onOver = function(e) {
       angular.element(e.target).addClass("hover");
      };

      $scope.onOut = function(e) {
        angular.element(e.target).removeClass("hover");
      };

      $scope.goto = function(page) {
        $scope.confluenceMode = page;
      };

      $scope.cancel = function(e) {
        if (e.preventDefault) { e.preventDefault(); }
        return false;
      }

      $scope.init = function() {
        $scope.data = undefined;
        $scope.excel = {
          sheets: [],
          sheet: undefined,
          headerRow: undefined,
          conditional_formatting: false
        }
        $scope.confluence = {
          pageId: undefined,
          pageTitle: undefined,
          header: ""
        }
      }

      $scope.handleDrop = function(e) {
        $scope.loading += 1;
        var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
        e.stopPropagation();
        e.preventDefault();
        $scope.filename = e.dataTransfer.files[0].name;
        $scope.file = e.dataTransfer.files[0];
        $scope.init();
        $scope.checkWorkbook();
        $scope.loading -= 1;
      }

      $scope.checkWorkbook = function() {
        var conf = {
          conditional_formatting: $scope.excel.conditional_formatting
        }
        if ($scope.excel.sheet !== undefined){
          conf.sheet = $scope.excel.sheet
        }
        else {
          // We just want the list of sheets no need for conditional formatting yet
          conf.conditional_formatting = false
        }
        ApiService.post_file("excel", $scope.file, conf, function(data) {
          $scope.excel.sheets = data.sheets;
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

      $scope.uploadConfluencePage = function(ev) {
        $scope.ConfluenceService.updateConfluencePage(ev, $scope.confluence.pageId, $scope.confluence.pageTitle, $scope.confluence.source)
      }

      $scope.toClipboard = function() {
          let data = document.getElementById("confluence-data").firstChild.data,
              copyFrom = document.createElement("textarea");
          document.body.appendChild(copyFrom);
          copyFrom.textContent = data;
          copyFrom.select();
          document.execCommand("copy");
          copyFrom.remove();
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
