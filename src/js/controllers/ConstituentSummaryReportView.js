dataViewerControllers.controller('ConstituentSummaryReportViewController', ['$scope', 'StorageService', 'ConstituentService', 'DateRangePickerService', 'DataTableService', function($scope, StorageService, ConstituentService, DateRangePickerService, DataTableService) {
  $.AdminLTE.layout.fix();
  
  $scope.updateTime = '';
  
  var refreshUpdateTime = function() {
    $scope.updateTime = 'Updated ' + moment().format('M/D/YYYY h:mma');
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  $scope.reportconfig = $.extend({
    datelabel: 'Last 24 Hours', 
    startdate: '', 
    enddate: '', 
    summaryinterval: 'hourly'
  }, StorageService.getStoredData('reportconfig_constituents_summary') || {});
  
  $('.daterangepicker').remove();
  
  DateRangePickerService.init('#report-config-datepicker', function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    updateDateRange(label);
  });
  
  var updateDateRange = function(label) {
    DateRangePickerService.getDatesForRange(label, function(start, end) {
      $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
      $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    });
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  $scope.constituents = [];
  
  $scope.constituentsums = [];
  
  var getConstituentSums = function() {
    ConstituentService.getConstituents({
      startDate: $scope.reportconfig.startdate, 
      endDate: $scope.reportconfig.enddate, 
      success: function(constituents) {
        if($scope.$location.path() === '/report-constituents-summary') {
          DataTableService.destroy('.report-table');
          
          if(constituents.length > 0) {
            $.each(constituents, function() {
              addConstituent(this);
            });
          }
          
          DataTableService.init('.report-table');
        }
      }, 
      complete: function() {
        if($scope.$location.path() === '/report-constituents-summary') {
          refreshUpdateTime();
          
          $('.content .js--loading-overlay').addClass('hidden');
        }
      }
    });
  }, 
  
  addConstituent = function(constituent) {
    $scope.constituents.push(constituent);
    
    var consCreationDate = constituent.CreationDate, 
    consCreationHour = moment(consCreationDate).format('YYYY-MM-DD[T]HH'), 
    consCreationPeriod = consCreationHour, 
    constituentSumIndex = -1;
    
    switch($scope.reportconfig.summaryinterval) {
      case 'daily':
        consCreationPeriod = moment(consCreationDate).format('YYYY-MM-DD');
        break;
      case 'weekly':
        consCreationPeriod = moment(consCreationDate).startOf('week').format('YYYY-MM-DD');
        break;
      case 'monthly':
        consCreationPeriod = moment(consCreationDate).format('YYYY-MM');
        break;
    }
    
    $.each($scope.constituentsums, function(sumIndex) {
      if(this.period === consCreationPeriod) {
        constituentSumIndex = sumIndex;
      }
    });
    
    if(constituentSumIndex === -1) {
      var consCreationPeriodFormatted = moment(consCreationDate).format('MMM D, YYYY - h:00a');
      
      switch($scope.reportconfig.summaryinterval) {
        case 'daily':
          consCreationPeriodFormatted = moment(consCreationDate).format('MMM D, YYYY');
          break;
        case 'weekly':
          consCreationPeriodFormatted = moment(consCreationDate).startOf('week').format('[Week of] MMM D, YYYY');
          break;
        case 'monthly':
          consCreationPeriodFormatted = moment(consCreationDate).format('MMM YYYY');
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
    updateDateRange($scope.reportconfig.datelabel);
    
    $scope.constituents = [];
    
    $scope.constituentsums = [];
    
    DataTableService.destroy('.report-table');
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
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