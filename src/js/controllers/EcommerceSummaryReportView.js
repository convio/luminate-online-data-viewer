dataViewerControllers.controller('EcommerceSummaryReportViewController', ['$scope', 'WebServicesService', function($scope, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.orders = [];
  
  $scope.ordersums = [];
  
  var addOrder = function(order) {
    $scope.orders.push(order);
    
    var paymentDate = order.Payment.PaymentDate, 
    paymentPeriod = paymentDate.split(':')[0], 
    paymentAmount = Number(order.Payment.Amount), 
    orderSumIndex = -1;
    
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
      }).format(new Date(paymentPeriod + ':00:00Z')) + ' - ' + new Intl.DateTimeFormat('en-us', {
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit'
      }).format(new Date(paymentPeriod + ':00:00Z'));
      
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
    oneDayAgo = new Date(now - (24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
    
    WebServicesService.query({
      statement: 'select TransactionId, Payment.Amount, Payment.PaymentDate from ProductOrder where Payment.PaymentDate >= ' + oneDayAgo, 
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
          
          if($records.length === 200) {
            getOrderSums({
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
  
  getOrderSums();
}]);