var ApiService = angular.module('ApiService', [])
ApiService.factory('ApiService', ['$http', '$window', '$log', '$mdToast', function ($http, $window, $log, $mdToast, LoginService) {

    var urlBase = '/';
    var Api = {
      loading: false
    };

    Api.fetch_data = function(endpoint, params, cb) {
      Api.loading += 1;
      if (params === undefined) {
        params = {};
      };
      $http.get(urlBase + endpoint, {params: params, headers: headers}).
      then(function(response) {
        $log.log(endpoint + " fetched.");
        Api.loading -= 1;
        cb(response.data);
      }).
      catch(function(response) {
        $log.log(response);
        Api.loading -= 1;
        if (response.status == 401) {
          Api.showErrorToast("Unauthorized.");
        }
        else if (response.status == 503) {
          Api.showErrorToast("Temporary error, please try again later.");
        }
        else {
          $log.log(response);
          Api.showErrorToast();
        }
      });
    };

    Api.post = function(endpoint, params, cb) {
      Api.loading += 1;
      headers = {};
      $http.post(urlBase + endpoint, params, {headers: headers}).
      then(function(response) {
        $log.log(endpoint + " post successfull.");
        Api.loading -= 1;
        cb(response.data);
      }).
      catch(function(response) {
        $log.log(response.data);
        Api.loading -= 1;
        if (response.status == 401) {
          Api.showErrorToast("Unauthorized.");
        }
        else if (response.status == 503) {
          Api.showErrorToast("Temporary error, please try again later.");
        }
        else {
          console.log(response);
          Api.showErrorToast();
        }
      });
    };

    Api.showErrorToast = function(message='An error occured, sorry') {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('bottom center')
          .hideDelay(10000)
          .theme("failure-toast")
      );
    };

    return Api;

}]);
