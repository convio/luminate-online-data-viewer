dataViewerControllers.controller('ConstituentsReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.constituents = [];
  
  var addConstituent = function(constituent) {
    $scope.constituents.push(constituent);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  now = new Date(), 
  oneMonthAgo = new Date(now - (30 * 24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
  
  WebServicesService.query({
    statement: 'select ConsName, CreationDate, PrimaryEmail from Constituent where CreationDate >= ' + oneMonthAgo, 
    error: function() {
      /* TODO */
    }, 
    success: function(response) {
      var $faultstring = $(response).find('faultstring');
      
      if($faultstring.length > 0) {
        /* TODO */
      }
      else {
        var $records = $(response).find('Record');
        
        $records.each(function() {
          var $consName = $(this).find('ConsName'), 
          consFirstName = $consName.find('FirstName').text(), 
          consLastName = $consName.find('LastName').text(), 
          consCreationDate = $(this).find('CreationDate').text(), 
          consPrimaryEmail = $(this).find('PrimaryEmail').text();
          
          addConstituent({
            ConsName: {
              FirstName: consFirstName, 
              LastName: consLastName
            }, 
            CreationDate: consCreationDate, 
            PrimaryEmail: consPrimaryEmail
          });
        });
        
        $('.report-table').DataTable({
          'paging': true, /* TODO: only paginate if there are more results than one page */
          'lengthChange': false, 
          'searching': false, 
          'ordering': true, 
          'order': [
            [3, 'desc']
          ], 
          'info': true, 
          'autoWidth': false
        });
        
        $('.content .js--loading-overlay').addClass('hidden');
      }
    }
  });
}]);