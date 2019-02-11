var ConfluenceService = angular.module('ConfluenceService', [])
ConfluenceService.factory('ConfluenceService', ['$http', '$mdToast', '$mdDialog', function ($http, $mdToast, $mdDialog) {

    var urlBase = "/confluence/api/content/";
    var Service = {
      loading: 0
    };
    var creds = {
      username: null,
      password: null
    }

    function DialogController($scope, $mdDialog) {
      $scope.serviceName = "confluence";
      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.submit = function(username, password) {
        creds = {
          username: username,
          password: password
        }
        $mdDialog.hide(creds);
      };
    }

    Service.requestCredentials = function(ev, cb) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'login_dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false
      })
      .then(function(info) {
        creds = info;
        cb();
      }, function() {});
    };

    Service.authHeader = function() {
      return {"Authorization": "Basic " + btoa(creds.username + ":" + creds.password)};
    };

    Service.getPageName = function(pageId, cb) {
      if (creds.password === null || creds.username === null) {
        Service.requestCredentials(null, function() {
          Service.getPageName(ev, data);
        });
        return;
      }
      let url = urlBase + pageId;
      Service.loading += 1;
      $http.get(url, {headers: Service.authHeader()})
      .then(function(response) {
        cb(response.data.title);
        Service.loading -= 1;
      })
      .catch(function(response) {
        console.log(response);
        Service.showErrorToast("An error occured fetching page name, are you sure about your credentials ?");
        creds = {username: null, password: null};
        Service.loading -= 1;
      })
    };

    Service.checkConfluencePageName = function(ev, data, animalName) {
      if (creds.password === null || creds.username === null) {
        Service.requestCredentials(ev, function() {
          Service.checkConfluencePageName(ev, data, animalName);
        });
        return;
      };
      if (data[animalName].confluence !== undefined && data[animalName].confluence.page_id !== undefined) {
        Service.getPageName(
          data[animalName].confluence.page_id,
          function(pageName) {data[animalName].confluence.page_title = pageName;}
        )
      };
    };

    Service.checkConfluencePageNames = function(ev, data, project) {
      if (creds.password === null || creds.username === null) {
        Service.requestCredentials(ev, function() {
          Service.checkConfluencePageNames(ev, data, project);
        });
        return;
      }
      angular.forEach(data, function(animalData, animalName) {
        if (animalData.confluence !== undefined && animalData.confluence.page_id !== undefined && animalData.project == project) {
          Service.getPageName(
            animalData.confluence.page_id,
            function(pageName) {animalData.confluence.page_title = pageName;}
          )
        }
      });
    };

    Service.doUpdateConfluencePage = function(page_id, page_title, content){
      let url = urlBase + page_id;
      let data = {
        "version": null,
        "title": page_title,
        "type": "page",
        "body": {
          "storage": {
            "value": content,
            "representation": "storage"
          }
        }
      };
      Service.loading += 1;
      $http.get(url, {headers: Service.authHeader()})
      .then(function(response) {
        if (page_title != response.data.title) {
          Service.showErrorToast("Page title {response.data.title} does not match configuration, ensure you update the right page.")
          Service.loading -= 1;
          return;
        }
        data.version = {"number": response.data.version.number + 1},

        Service.loading += 1;
        $http.put(url, data, {headers: Service.authHeader()})
        .then(function(response) {
          Service.showSuccessToast("Confluence page updated successfuly.");
          Service.loading -= 1;
        })
        .catch(function(response) {
          console.log(response);
          Service.showErrorToast("An error occured, you can still update the page by hand.");
          Service.loading -= 1;
        })
        Service.loading -= 1;
      })
      .catch(function(response) {
        console.log(response);
        Service.showErrorToast("An error occured fetching page information, are you sure about your credentials ?");
        creds = {username: null, password: null}
        Service.loading -= 1;
      })
    };

    Service.updateConfluencePage = function(ev, page_id, page_title, content) {
      if (creds.password === null || creds.username === null) {
        Service.requestCredentials(ev, function() {
          Service.updateConfluencePage(ev, page_id, page_title, content);
        });
        return;
      };
      Service.doUpdateConfluencePage(page_id, page_title, content);
    };

    Service.showErrorToast = function(message='An error occured, please check it with @Laurent Erignoux!') {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('bottom center')
          .hideDelay(10000)
          .theme("failure-toast")
      );
    };

    Service.showSuccessToast = function(message) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('bottom center')
          .hideDelay(3000)
          .theme("success-toast")
      );
    };

    return Service;

}]);
