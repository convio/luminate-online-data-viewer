dataViewerControllers.controller('EcommerceSummaryReportViewController', ['$scope', 'StorageService', 'WebServicesService', function($scope, StorageService, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $('#report-config-datepicker').daterangepicker({
    startDate: moment().subtract(1, 'days'), 
    endDate: moment(), 
    ranges: {
      'Last 24 Hours': [
        moment().subtract(1, 'days'), 
        moment()
      ], 
      'Today': [
        moment().startOf('day'), 
        moment()
      ], 
      'Yesterday': [
        moment().subtract(1, 'days').startOf('day'), 
        moment().subtract(1, 'days').endOf('day')
      ], 
      'Last 7 Days': [
        moment().subtract(6, 'days'), 
        moment()
      ], 
      'Last 30 Days': [
        moment().subtract(29, 'days'), 
        moment()
      ], 
      'This Month': [
        moment().startOf('month'), 
        moment().endOf('month')
      ], 
      'Last Month': [
        moment().subtract(1, 'month').startOf('month'), 
        moment().subtract(1, 'month').endOf('month')
      ]
    }, 
    timePicker: true
  }, function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    $scope.reportconfig.startdate = start.format('YYYY-MM-DDThh:mm:00');
    $scope.reportconfig.enddate = end.format('YYYY-MM-DDThh:mm:00');
    
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
  
  var addOrder = function(order) {
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
  }, 
  
  getOrderSums = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {}), 
    now = new Date(), 
    startDate = new Date(now - (24 * 60 * 60 * 1000)).toISOString().split('.')[0], 
    endDate = now.toISOString().split('.')[0];
    
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
      statement: 'select TransactionId, Payment.Amount, Payment.PaymentDate' + 
                 ' from ProductOrder' + 
                 ' where Payment.PaymentDate &gt;= ' + startDate + ' and Payment.PaymentDate &lt;= ' + endDate, 
      page: settings.page, 
      error: function() {
        /* TODO */
      }, 
      success: function(response) {
        $('.report-table').DataTable().destroy();
        
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
              var transactionId = $(this).find('TransactionId').text(), 
              $payment = $(this).find('Payment'), 
              paymentAmount = $payment.find('Amount').text(), 
              paymentDate = $payment.find('PaymentDate').text();
              
              var orderData = {
                'TransactionId': transactionId, 
                'Payment': {
                  'Amount': paymentAmount, 
                  'PaymentDate': paymentDate
                }
              };
              
              addOrder(orderData);
            });
          }
          
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
          
          if($records.length === 200) {
            getOrderSums({
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
  
  getOrderSums();
  
  $scope.refreshReport = function() {
    $scope.orders = [];
    
    $scope.ordersums = [];
    
    $('.report-table').DataTable().destroy();
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    getOrderSums();
  };
  
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