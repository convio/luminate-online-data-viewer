dataViewerApp.directive('mainSidebar', function() {
  return {
    templateUrl: 'directives/mainSidebar.html', 
    restrict: 'A', 
    replace: true, 
    controller: function() {
      $.AdminLTE.layout.fix();
      
      $.AdminLTE.layout.fixSidebar();
    }
  }
});