angular.module 'dataViewerApp', [
  'ngRoute'
  'ui.bootstrap'
  'dataViewerControllers'
]
angular.module 'dataViewerControllers', []

document.addEventListener 'contextmenu', (e) ->
  e.preventDefault()