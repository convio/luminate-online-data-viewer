angular.module 'dataViewerApp'
  .directive 'mainHeader', ->
    templateUrl: 'directive/mainHeader.html'
    restrict: 'A'
    replace: true
    controller: ->
      $.AdminLTE.pushMenu.activate $.AdminLTE.options.sidebarToggleSelector
      $.AdminLTE.layout.fix()
      $.AdminLTE.layout.fixSidebar()
      $.AdminLTE.pushMenu.activate $.AdminLTE.options.sidebarToggleSelector