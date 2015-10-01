dataViewerControllers.controller('ConstituentSummaryReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.constituents = [];
  
  $scope.constituentsums = [];
  
  var addConstituent = function(constituent) {
    $scope.constituents.push(constituent);
    
    var consCreationDate = constituent.CreationDate, 
    consCreationPeriod = consCreationDate.split(':')[0], 
    constituentSumIndex;
    
    $.each($scope.constituentsums, function(sumIndex) {
      if(this.period === consCreationPeriod) {
        constituentSumIndex = sumIndex;
      }
    });
    
    if(!constituentSumIndex) {
      var consCreationPeriodFormatted = new Intl.DateTimeFormat('en-us', {
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      }).format(new Date(consCreationPeriod + ':00:00Z')) + ' - ' + new Intl.DateTimeFormat('en-us', {
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit'
      }).format(new Date(consCreationPeriod + ':00:00Z'));
      
      $scope.constituentsums.push({
        period: consCreationPeriod, 
        periodFormatted: consCreationPeriodFormatted, 
        count: 0
      });
      
      constituentSumIndex = $scope.constituentsums.length - 1;
    }
    
    $scope.constituentsums[constituentSumIndex].count = $scope.constituentsums[constituentSumIndex].count + 1;
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getConstituentSums = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {}), 
    
    now = new Date(), 
    oneDayAgo = new Date(now - (24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
    
    WebServicesService.query({
      statement: 'select ConsId, CreationDate from Constituent where CreationDate >= ' + oneDayAgo, 
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
              consCreationDate = $(this).find('CreationDate').text();
              
              addConstituent({
                'ConsId': consId, 
                'CreationDate': consCreationDate
              });
            });
          }
          
          if($records.length === 200) {
            getConstituentSums({
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
                [0, 'desc']
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
  
  getConstituentSums();
}]);