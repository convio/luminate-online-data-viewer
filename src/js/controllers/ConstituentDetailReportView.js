dataViewerControllers.controller('ConstituentDetailReportViewController', ['$scope', 'WebServicesService', function($scope, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.constituents = [];
  
  var addConstituent = function(constituent) {
    $scope.constituents.push(constituent);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getConstituents = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {}), 
    
    now = new Date(), 
    oneDayAgo = new Date(now - (24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
    
    WebServicesService.query({
      statement: 'select ConsId, ConsName, CreationDate, PrimaryEmail from Constituent where CreationDate >= ' + oneDayAgo, 
      page: settings.page, 
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
          
          if($records.length === 0) {
            /* TODO */
          }
          else {
            $records.each(function() {
              var consId = $(this).find('ConsId').text(), 
              $consName = $(this).find('ConsName'), 
              consFirstName = $consName.find('FirstName').text(), 
              consLastName = $consName.find('LastName').text(), 
              consCreationDate = $(this).find('CreationDate').text(), 
              consCreationDateFormatted = new Intl.DateTimeFormat().format(new Date(consCreationDate)), 
              consPrimaryEmail = $(this).find('PrimaryEmail').text();
              
              var constituentData = {
                'ConsId': consId, 
                'ConsName': {
                  'FirstName': consFirstName, 
                  'LastName': consLastName
                }, 
                'CreationDate': consCreationDate, 
                '_CreationDateFormatted': consCreationDateFormatted, 
                'PrimaryEmail': consPrimaryEmail
              };
              
              addConstituent(constituentData);
            });
          }
          
          if($records.length === 200) {
            getConstituents({
              page: '' + (Number(settings.page) + 1)
            });
          }
          else {
            $('.report-table').DataTable({
              'paging': true, 
              'lengthChange': false, 
              'searching': false, 
              'ordering': true, 
              'order': [
                [4, 'desc']
              ], 
              'info': true, 
              'autoWidth': false
            });
            
            $('.content .js--loading-overlay').addClass('hidden');
          }
        }
      }
    });
  };
  
  getConstituents();
}]);