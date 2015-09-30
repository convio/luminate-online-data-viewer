dataViewerControllers.controller('ConstituentSummaryReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $('.report-table').DataTable({
    'paging': true, 
    'lengthChange': false, 
    'searching': false, 
    'ordering': true, 
    'order': [
      [0, 'desc']
    ], 
    'info': true, 
    'autoWidth': false
  });
  
  $('.content .js--loading-overlay').addClass('hidden');
}]);