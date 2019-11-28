angular.module 'dataViewerApp'
  .directive 'mainSidebar', ->
    templateUrl: 'directive/mainSidebar.html'
    restrict: 'A'
    replace: true
    controller: ->
      $.AdminLTE.layout.fix()
      $.AdminLTE.layout.fixSidebar()