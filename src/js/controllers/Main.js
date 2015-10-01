dataViewerControllers.controller('MainController', ['$scope', '$route', '$location', function($scope, $route, $location) {
  $scope.manifest = gui.App.manifest;
  
  $scope.$route = $route;
  $scope.$location = $location;
}]);