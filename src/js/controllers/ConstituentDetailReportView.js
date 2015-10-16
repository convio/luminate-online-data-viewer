dataViewerControllers.controller('ConstituentDetailReportViewController', ['$scope', 'StorageService', 'ConstituentService', 'DateRangePickerService', 'DataTableService', function($scope, StorageService, ConstituentService, DateRangePickerService, DataTableService) {
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
    enddate: ''
  }, StorageService.getStoredData('reportconfig_constituents_detail') || {});
  
  $scope.constituents = [];
  
  var getConstituents = function() {
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
        
        DataTableService.init('.report-table', {
          'order': [
            [6, 'desc']
          ]
        });
      }, 
      complete: function() {
        $('.content .js--loading-overlay').addClass('hidden');
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
    
    DateRangePickerService.getDatesForRange($scope.reportconfig.datelabel, function(start, end) {
      $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
      $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    });
    
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