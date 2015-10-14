dataViewerControllers.controller('ConstituentSummaryReportViewController', ['$scope', 'DateRangePickerService', 'StorageService', 'WebServicesService', function($scope, DateRangePickerService, StorageService, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $('.daterangepicker').remove();
  
  DateRangePickerService.init('#report-config-datepicker', function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
    $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });
  
  $scope.reportconfig = $.extend({
    datelabel: 'Last 24 Hours', 
    startdate: '', 
    enddate: '', 
    summaryinterval: 'hourly'
  }, StorageService.getStoredData('reportconfig_constituents_summary') || {});
  
  $scope.constituents = [];
  
  $scope.constituentsums = [];
  
  var addConstituent = function(constituent) {
    $scope.constituents.push(constituent);
    
    var consCreationDate = constituent.CreationDate, 
    consCreationHour = consCreationDate.split(':')[0], 
    consCreationPeriod = consCreationHour, 
    constituentSumIndex = -1;
    
    switch($scope.reportconfig.summaryinterval) {
      case 'daily':
        consCreationPeriod = consCreationPeriod.split('T')[0];
        break;
      case 'weekly':
        /* TODO */
        break;
      case 'monthly':
        consCreationPeriod = consCreationPeriod.split('T')[0].split('-')[0] + consCreationPeriod.split('T')[0].split('-')[1];
        break;
    }
    
    $.each($scope.constituentsums, function(sumIndex) {
      if(this.period === consCreationPeriod) {
        constituentSumIndex = sumIndex;
      }
    });
    
    if(constituentSumIndex === -1) {
      var consCreationPeriodFormatted = new Intl.DateTimeFormat('en-us', {
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      }).format(new Date(consCreationHour + ':00:00Z')) + ' - ' + new Intl.DateTimeFormat('en-us', {
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit'
      }).format(new Date(consCreationHour + ':00:00Z'));
      
      switch($scope.reportconfig.summaryinterval) {
        case 'daily':
          consCreationPeriodFormatted = Intl.DateTimeFormat('en-us', {
            month: 'short', 
            day: 'numeric', 
            year: 'numeric'
          }).format(new Date(consCreationHour + ':00:00Z'));
          break;
        case 'weekly':
          /* TODO */
          break;
        case 'monthly':
          consCreationPeriodFormatted = Intl.DateTimeFormat('en-us', {
            month: 'short', 
            year: 'numeric'
          }).format(new Date(consCreationHour + ':00:00Z'));
          break;
      }
      
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
    startDate = moment().subtract(1, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ'), 
    endDate = moment().format('YYYY-MM-DD[T]HH:mm:ssZ');
    
    if($scope.reportconfig.startdate !== '') {
      startDate = $scope.reportconfig.startdate;
      
      if($scope.reportconfig.enddate !== '') {
        endDate = $scope.reportconfig.enddate;
      }
    }
    else if($scope.reportconfig.enddate !== '') {
      startDate = '1969-12-31T00:00:00';
      endDate = $scope.reportconfig.enddate;
    }
    
    WebServicesService.query({
      statement: 'select ConsId, CreationDate' + 
                 ' from Constituent' + 
                 ' where CreationDate &gt;= ' + startDate + ' and CreationDate &lt;= ' + endDate, 
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
          $('.report-table').DataTable().destroy();
          
          var $records = $(response).find('Record');
          
          if($records.length !== 0) {
            $records.each(function() {
              var consId = $(this).find('ConsId').text(), 
              consCreationDate = $(this).find('CreationDate').text();
              
              var constituentData = {
                'ConsId': consId, 
                'CreationDate': consCreationDate
              };
              
              addConstituent(constituentData);
            });
          }
          
          $('.report-table').DataTable({
            'searching': false, 
            'info': true, 
            'paging': true, 
            'lengthChange': false, 
            'ordering': true, 
            'order': [
              [0, 'desc']
            ], 
            'autoWidth': false, 
            'dom': '<".table-responsive"t>ip'
          });
          
          if($records.length === 200) {
            getConstituentSums({
              page: '' + (Number(settings.page) + 1)
            });
          }
          else {
            $('.content .js--loading-overlay').addClass('hidden');
          }
        }
      }
    });
  };
  
  getConstituentSums();
  
  $scope.refreshReport = function() {
    $scope.constituents = [];
    
    $scope.constituentsums = [];
    
    $('.report-table').DataTable().destroy();
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    $('.daterangepicker .applyBtn').click();
    
    getConstituentSums();
  };
  
  $scope.updateReportConfig = function(e) {
    $('#report-config-modal').modal('hide');
    
    StorageService.storeData('reportconfig_constituents_summary', $scope.reportconfig, true);
    
    $scope.refreshReport();
  };
  
  $scope.download = function() {
    var csvData = 'Time Period,Total Count';
    $.each($scope.constituentsums, function() {
      csvData += '\n' + 
                 '"' + this.periodFormatted + '",' + 
                 this.count;
    });
    
    $('.js--report-save-as').off('change').on('change', function() {
      require('fs').writeFile($(this).val(), csvData, function(error) {
        if(error) {
          /* TODO */
        }
      });
    }).click();  
  };
}]);