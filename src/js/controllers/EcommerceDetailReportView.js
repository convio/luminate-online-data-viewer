dataViewerControllers.controller('EcommerceDetailReportViewController', ['$scope', 'StorageService', 'ProductOrderService', 'DateRangePickerService', 'DataTableService', function($scope, StorageService, ProductOrderService, DateRangePickerService, DataTableService) {
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
  }, StorageService.getStoredData('reportconfig_ecommerce_detail') || {});
  
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
  
  $scope.orders = [];
  
  var getOrders = function() {
    ProductOrderService.getProductOrders({
      startDate: $scope.reportconfig.startdate.format('YYYY-MM-DD[T]HH:mm:ssZ'), 
      endDate: $scope.reportconfig.enddate.format('YYYY-MM-DD[T]HH:mm:ssZ'), 
      success: function(productOrders) {
        if($scope.$location.path() === '/report-ecommerce-detail') {
          DataTableService.destroy('.report-table');
          
          if(productOrders.length > 0) {
            $.each(productOrders, function() {
              addOrder(this);
            });
          }
          
          DataTableService.init('.report-table', {
            'order': [
              [8, 'desc']
            ]
          });
        }
      }, 
      complete: function() {
        if($scope.$location.path() === '/report-ecommerce-detail') {
          refreshUpdateTime();
          
          $('.content .js--loading-overlay').addClass('hidden');
        }
      }
    });
  }, 
  
  addOrder = function(order) {
    $scope.orders.push(order);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  getOrders();
  
  $scope.refreshReport = function() {
    $scope.orders = [];
    
    updateDateRange($scope.reportconfig.startdate, $scope.reportconfig.enddate, $scope.reportconfig.datelabel);
    
    DataTableService.destroy('.report-table');
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    getOrders();
  };
  
  $scope.updateReportConfig = function(e) {
    $('#report-config-modal').modal('hide');
    
    StorageService.storeData('reportconfig_ecommerce_detail', $scope.reportconfig, true);
    
    $scope.refreshReport();
  };
  
  $scope.download = function() {
    var csvData = 'Transaction ID,Store ID,Order Amount,First Name,Last Name,Email Address,City,State,Order Date';
    $.each($scope.orders, function() {
      csvData += '\n' + 
                 this.TransactionId + ',' + 
                 this.StoreId + ',' + 
                 this.Payment.Amount + ',' + 
                 '"' + this.Purchaser.ConsName.FirstName.replace(/"/g, '""') + '",' + 
                 '"' + this.Purchaser.ConsName.LastName.replace(/"/g, '""') + '",' + 
                 this.Purchaser.PrimaryEmail + ',' + 
                 this.Purchaser.HomeAddress.City + ',' + 
                 this.Purchaser.HomeAddress.State + ',' + 
                 this.Payment._PaymentDateFormatted;
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