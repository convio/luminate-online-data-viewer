dataViewerControllers.controller('MainController', ['$scope', '$route', '$location', function($scope, $route, $location) {
  $scope.manifest = gui.App.manifest;
  
  $scope.$route = $route;
  $scope.$location = $location;
  
  var checkForUpdates = function(showNoNewModal) {
    $.ajax({
      url: $scope.manifest.manifestUrl, 
      dataType: 'json', 
      error: function() {
        /* TODO */
      }, 
      success: function(response) {
        var activeVersion = $scope.manifest.version, 
        currentVersion = response.version || activeVersion, 
        currentVersionIsNew = false;
        
        if(activeVersion.split('.')[0] < currentVersion.split('.')[0]) {
          currentVersionIsNew = true;
        }
        else if(activeVersion.split('.')[0] === currentVersion.split('.')[0] && 
                activeVersion.split('.')[1] < currentVersion.split('.')[1]) {
          currentVersionIsNew = true;
        }
        else if(activeVersion.split('.')[0] === currentVersion.split('.')[0] && 
                activeVersion.split('.')[1] === currentVersion.split('.')[1] && 
                activeVersion.split('.')[2] < currentVersion.split('.')[2]) {
          currentVersionIsNew = true;
        }
        
        if(!currentVersionIsNew && showNoNewModal) {
          $('#no-new-version-modal').modal('show');
        }
        else if(currentVersionIsNew) {
          $('#new-version-modal').modal('show');
        }
      }
    });
  };
  
  checkForUpdates(false);
  
  $scope.checkForUpdates = function() {
    checkForUpdates(true);
  };
}]);