dataViewerApp.directive('mainHeader', function() {
  return {
    templateUrl: 'directives/mainHeader.html', 
    restrict: 'A', 
    replace: true, 
    controller: function() {
      $.AdminLTE.pushMenu.activate($.AdminLTE.options.sidebarToggleSelector);
      
      $.AdminLTE.layout.fix();
      
      $.AdminLTE.layout.fixSidebar();
    }
  }
});