angular.module 'dataViewerApp', [
  'ngRoute'
  'ui.bootstrap'
  'dataViewerControllers'
]
dataViewerControllers = angular.module 'dataViewerControllers', []

document.addEventListener 'contextmenu', (e) ->
  e.preventDefault()