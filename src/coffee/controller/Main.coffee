dataViewerControllers.controller 'MainController', [
  '$scope'
  '$route'
  '$location'
  ($scope, $route, $location) ->
    $scope.manifest = gui.App.manifest
    $scope.$route = $route
    $scope.$location = $location
    
    checkForUpdates = (showNoNewModal) ->
      $.ajax
        url: $scope.manifest.manifestUrl
        dataType: 'json'
        error: ->
          angular.noop()
        success: (response) ->
          activeVersion = $scope.manifest.version
          currentVersion = response.version or activeVersion
          currentVersionIsNew = false
          
          if activeVersion.split('.')[0] < currentVersion.split('.')[0]
            currentVersionIsNew = true
          else if activeVersion.split('.')[0] is currentVersion.split('.')[0] and activeVersion.split('.')[1] < currentVersion.split('.')[1]
            currentVersionIsNew = true
          else if activeVersion.split('.')[0] is currentVersion.split('.')[0] and activeVersion.split('.')[1] is currentVersion.split('.')[1] and activeVersion.split('.')[2] < currentVersion.split('.')[2]
            currentVersionIsNew = true
          
          if not currentVersionIsNew and showNoNewModal
            $('#no-new-version-modal').modal 'show'
          else if currentVersionIsNew
            $('#new-version-modal').modal 'show'
    checkForUpdates false
    $scope.checkForUpdates = ->
      checkForUpdates true
]