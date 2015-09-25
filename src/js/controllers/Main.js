dataViewerControllers.controller('MainController', ['$scope', '$route', '$location', function($scope, $route, $location) {
  $scope.$route = $route;
  $scope.$location = $location;
  
  $scope.$on('$locationChangeStart', function(event, newLocation) {
    if(newLocation) {
      var newRouteAndParams = newLocation.split('#/')[1];
      if(newRouteAndParams) {
        var newRoute = newRouteAndParams.split('/')[0];
        if(newRoute === 'login') {
          $('body').removeClass('skin-blue sidebar-mini fixed').addClass('login-page');
        }
        else {
          $('body').removeClass('login-page').addClass('skin-blue sidebar-mini fixed');
        }
      }
    }
  });
}]);