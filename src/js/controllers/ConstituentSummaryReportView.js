dataViewerControllers.controller('ConstituentSummaryReportViewController', ['$scope', 'StorageService', 'ConstituentService', 'DateRangePickerService', 'DataTableService', function($scope, StorageService, ConstituentService, DateRangePickerService, DataTableService) {
  $.AdminLTE.layout.fix();
  
  $('.daterangepicker').remove();
  
  DateRangePickerService.init('#report-config-datepicker', function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    DateRangePickerService.getDatesForRange(label, function(start, end) {
      $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
      $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    });
    
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
  
  var getConstituentSums = function() {
    ConstituentService.getConstituents({
      startDate: $scope.reportconfig.startdate, 
      endDate: $scope.reportconfig.enddate, 
      success: function(constituents) {
        DataTableService.destroy('.report-table');
        
        if(constituents.length > 0) {
          $.each(constituents, function() {
            addConstituent(this);
          });
        }
        
        DataTableService.init('.report-table');
      }, 
      complete: function() {
        $('.content .js--loading-overlay').addClass('hidden');
      }
    });
  }, 
  
  addConstituent = function(constituent) {
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
  };
  
  getConstituentSums();
  
  $scope.refreshReport = function() {
    $scope.constituents = [];
    
    $scope.constituentsums = [];
    
    DateRangePickerService.getDatesForRange($scope.reportconfig.datelabel, function(start, end) {
      $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
      $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    });
    
    DataTableService.destroy('.report-table');
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    getConstituentSums();
  };
  
  /* TODO: resetReportConfig */
  
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