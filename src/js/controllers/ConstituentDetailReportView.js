dataViewerControllers.controller('ConstituentDetailReportViewController', ['$scope', 'StorageService', 'ConstituentService', 'DateRangePickerService', 'DataTableService', function($scope, StorageService, ConstituentService, DateRangePickerService, DataTableService) {
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
    startdate: moment().subtract(1, 'days'), 
    enddate: moment()
  }, StorageService.getStoredData('reportconfig_constituents_detail') || {});
  
  $('.daterangepicker').remove();
  
  DateRangePickerService.init('#report-config-datepicker', function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    updateDateRange(start, end, label);
  });
  
  var updateDateRange = function(start, end, label) {
    if(label === 'Custom Range') {
      $scope.reportconfig.startdate = start;
      $scope.reportconfig.enddate = end;
    }
    else {
      DateRangePickerService.getDatesForRange(label, function(start, end) {
        $scope.reportconfig.startdate = start;
        $scope.reportconfig.enddate = end;
      });
    }
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  $scope.constituents = [];
  
  var getConstituents = function() {
    ConstituentService.getConstituents({
      startDate: $scope.reportconfig.startdate.format('YYYY-MM-DD[T]HH:mm:ssZ'), 
      endDate: $scope.reportconfig.enddate.format('YYYY-MM-DD[T]HH:mm:ssZ'), 
      success: function(constituents) {
        if($scope.$location.path() === '/report-constituents-detail') {
          DataTableService.destroy('.report-table');
          
          if(constituents.length > 0) {
            $.each(constituents, function() {
              addConstituent(this);
            });
          }
          
          DataTableService.init('.report-table', {
            'order': [
              [6, 'desc']
            ]
          });
        }
      }, 
      complete: function() {
        if($scope.$location.path() === '/report-constituents-detail') {
          refreshUpdateTime();
          
          $('.content .js--loading-overlay').addClass('hidden');
        }
      }
    });
  }, 
  
  addConstituent = function(constituent) {
    $scope.constituents.push(constituent);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  getConstituents();
  
  $scope.refreshReport = function() {
    $scope.constituents = [];
    
    updateDateRange($scope.reportconfig.startdate, $scope.reportconfig.enddate, $scope.reportconfig.datelabel);
    
    DataTableService.destroy('.report-table');
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    getConstituents();
  };
  
  $scope.updateReportConfig = function(e) {
    $('#report-config-modal').modal('hide');
    
    StorageService.storeData('reportconfig_constituents_detail', $scope.reportconfig, true);
    
    $scope.refreshReport();
  };
  
  $scope.download = function() {
    var csvData = 'Constituent ID,First Name,Last Name,Email Address,City,State,Creation Date';
    $.each($scope.constituents, function() {
      csvData += '\n' + 
                 this.ConsId + ',' + 
                 '"' + this.ConsName.FirstName.replace(/"/g, '""') + '",' + 
                 '"' + this.ConsName.LastName.replace(/"/g, '""') + '",' + 
                 this.PrimaryEmail + ',' + 
                 this.HomeAddress.City + ',' + 
                 this.HomeAddress.State + ',' + 
                 this._CreationDateFormatted;
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