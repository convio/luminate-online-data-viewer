dataViewerControllers.controller('EcommerceDetailReportViewController', ['$scope', 'WebServicesService', function($scope, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.orders = [];
  
  var addOrder = function(order) {
    $scope.orders.push(order);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getOrders = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {}), 
    now = new Date(), 
    oneDayAgo = new Date(now - (24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
    
    WebServicesService.query({
      statement: 'select TransactionId, StoreId, Payment.Amount, Payment.PaymentDate, Purchaser.ConsName, Purchaser.PrimaryEmail from ProductOrder where Payment.PaymentDate >= ' + oneDayAgo, 
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
              storeId = $(this).find('StoreId').text(), 
              $payment = $(this).find('Payment'), 
              paymentAmount = Number($payment.find('Amount').text()), 
              paymentAmountFormatted = paymentAmount.toLocaleString('en', {
                style: 'currency', 
                currency: 'USD', 
                minimumFractionDigits: 2
              }), 
              paymentDate = $payment.find('PaymentDate').text(), 
              paymentDateFormatted = new Intl.DateTimeFormat().format(new Date(paymentDate)), 
              $purchaser = $(this).find('Purchaser'), 
              $purchaserName = $purchaser.find('ConsName'), 
              purchaserFirstName = $purchaserName.find('FirstName').text(), 
              purchaserLastName = $purchaserName.find('LastName').text(), 
              purchaserPrimaryEmail = $purchaser.find('PrimaryEmail').text();
              
              var orderData = {
                'TransactionId': transactionId, 
                'StoreId': storeId, 
                'Payment': {
                  'Amount': paymentAmount, 
                  '_AmountFormatted': paymentAmountFormatted, 
                  'PaymentDate': paymentDate, 
                  '_PaymentDateFormatted': paymentDateFormatted
                }, 
                'Purchaser': {
                  'ConsName': {
                    'FirstName': purchaserFirstName, 
                    'LastName': purchaserLastName
                  }, 
                  'PrimaryEmail': purchaserPrimaryEmail
                }
              };
              
              addOrder(orderData);
            });
          }
          
          if($records.length === 200) {
            getOrders({
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
                [4, 'desc']
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
  
  getOrders();
  
  $scope.download = function() {
    var csvData = 'Transaction ID,Store ID,Order Amount,First Name,Last Name,Email Address,Order Date';
    $.each($scope.orders, function() {
      csvData += '\n' + 
                 this.TransactionId + ',' + 
                 this.StoreId + ',' + 
                 this.Payment._AmountFormatted + ',' + 
                 '"' + this.Purchaser.ConsName.FirstName.replace(/"/g, '""') + '",' + 
                 '"' + this.Purchaser.ConsName.LastName.replace(/"/g, '""') + '",' + 
                 this.Purchaser.PrimaryEmail + ',' + 
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