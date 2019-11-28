angular.module 'dataViewerApp'
  .config [
    '$locationProvider'
    ($locationProvider) ->
      $locationProvider.hashPrefix ''
  ]