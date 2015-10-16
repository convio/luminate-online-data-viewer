dataViewerControllers.controller('EcommerceSummaryReportViewController', ['$scope', 'StorageService', 'ProductOrderService', 'DateRangePickerService', 'DataTableService', function($scope, StorageService, ProductOrderService, DateRangePickerService, DataTableService) {
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
  }, StorageService.getStoredData('reportconfig_ecommerce_summary') || {});
  
  $scope.orders = [];
  
  $scope.ordersums = [];
  
  var getOrderSums = function(options) {
    ProductOrderService.getProductOrders({
      startDate: $scope.reportconfig.startdate, 
      endDate: $scope.reportconfig.enddate, 
      success: function(productOrders) {
        DataTableService.destroy('.report-table');
        
        if(productOrders.length > 0) {
          $.each(productOrders, function() {
            addOrder(this);
          });
        }
        
        DataTableService.init('.report-table');
      }, 
      complete: function() {
        $('.content .js--loading-overlay').addClass('hidden');
      }
    });
  }, 
  
  addOrder = function(order) {
    $scope.orders.push(order);
    
    var paymentDate = order.Payment.PaymentDate, 
    paymentHour = paymentDate.split(':')[0], 
    paymentPeriod = paymentHour, 
    paymentAmount = Number(order.Payment.Amount), 
    orderSumIndex = -1;
    
    switch($scope.reportconfig.summaryinterval) {
      case 'daily':
        paymentPeriod = paymentPeriod.split('T')[0];
        break;
      case 'weekly':
        /* TODO */
        break;
      case 'monthly':
        paymentPeriod = paymentPeriod.split('T')[0].split('-')[0] + paymentPeriod.split('T')[0].split('-')[1];
        break;
    }
    
    $.each($scope.ordersums, function(sumIndex) {
      if(this.period === paymentPeriod) {
        orderSumIndex = sumIndex;
      }
    });
    
    if(orderSumIndex === -1) {
      var paymentPeriodFormatted = new Intl.DateTimeFormat('en-us', {
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      }).format(new Date(paymentHour + ':00:00Z')) + ' - ' + new Intl.DateTimeFormat('en-us', {
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit'
      }).format(new Date(paymentHour + ':00:00Z'));
      
      switch($scope.reportconfig.summaryinterval) {
        case 'daily':
          paymentPeriodFormatted = Intl.DateTimeFormat('en-us', {
            month: 'short', 
            day: 'numeric', 
            year: 'numeric'
          }).format(new Date(paymentHour + ':00:00Z'));
          break;
        case 'weekly':
          /* TODO */
          break;
        case 'monthly':
          paymentPeriodFormatted = Intl.DateTimeFormat('en-us', {
            month: 'short', 
            year: 'numeric'
          }).format(new Date(paymentHour + ':00:00Z'));
          break;
      }
      
      $scope.ordersums.push({
        period: paymentPeriod, 
        periodFormatted: paymentPeriodFormatted, 
        count: 0, 
        amount: 0, 
        amountFormatted: '$0.00'
      });
      
      orderSumIndex = $scope.ordersums.length - 1;
    }
    
    $scope.ordersums[orderSumIndex].count = $scope.ordersums[orderSumIndex].count + 1;
    $scope.ordersums[orderSumIndex].amount = Number($scope.ordersums[orderSumIndex].amount) + paymentAmount;
    $scope.ordersums[orderSumIndex].amountFormatted = $scope.ordersums[orderSumIndex].amount.toLocaleString('en', {
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 2
    });
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  getOrderSums();
  
  $scope.refreshReport = function() {
    $scope.orders = [];
    
    $scope.ordersums = [];
    
    DateRangePickerService.getDatesForRange($scope.reportconfig.datelabel, function(start, end) {
      $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
      $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    });
    
    DataTableService.destroy('.report-table');
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    getOrderSums();
  };
  
  /* TODO: resetReportConfig */
  
  $scope.updateReportConfig = function(e) {
    $('#report-config-modal').modal('hide');
    
    StorageService.storeData('reportconfig_ecommerce_summary', $scope.reportconfig, true);
    
    $scope.refreshReport();
  };
  
  $scope.download = function() {
    var csvData = 'Time Period,Total Count,Total Amount';
    $.each($scope.ordersums, function() {
      csvData += '\n' + 
                 '"' + this.periodFormatted + '",' + 
                 this.count + ',' + 
                 this.amountFormatted;
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