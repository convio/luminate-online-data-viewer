dataViewerApp.factory('ProductOrderService', ['WebServicesService', function(WebServicesService) {
  return {
    getProductOrders: function(options) {
      var _this = this, 
      settings = $.extend({
        page: '1', 
        fault: $.noop, 
        success: $.noop, 
        complete: $.noop
      }, options || {});
      
      if(!settings.startDate || settings.startDate === '') {
        settings.startDate = moment().subtract(1, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ');
      }
      if(!settings.endDate || settings.endDate === '') {
        settings.endDate = moment(settings.startDate).add(1, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ');
      }
      
      WebServicesService.query({
        statement: 'select TransactionId, StoreId,' + 
                 ' Payment.Amount, Payment.PaymentDate,' + 
                 ' Purchaser.ConsName.FirstName, Purchaser.ConsName.LastName,' + 
                 ' Purchaser.PrimaryEmail,' + 
                 ' Purchaser.HomeAddress.City, Purchaser.HomeAddress.State' + 
                 ' from ProductOrder' + 
                 ' where Payment.PaymentDate &gt;= ' + settings.startDate + 
                 ' and Payment.PaymentDate &lt;= ' + settings.endDate, 
        page: settings.page, 
        error: function() {
          /* TODO */
        }, 
        success: function(response) {
          var $faultstring = $(response).find('faultstring');
          
          if($faultstring.length > 0) {
            settings.fault($faultstring.text());
          }
          else {
            var productOrders = [], 
            $records = $(response).find('Record');
            
            if($records.length === 0) {
              settings.success(productOrders);
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
                paymentDateFormatted = moment(paymentDate).format('MM/DD/YYYY h:mma'), 
                $purchaser = $(this).find('Purchaser'), 
                $purchaserName = $purchaser.find('ConsName'), 
                purchaserFirstName = $purchaserName.find('FirstName').text(), 
                purchaserLastName = $purchaserName.find('LastName').text(), 
                purchaserPrimaryEmail = $purchaser.find('PrimaryEmail').text(), 
                $purchaserHomeAddress = $(this).find('HomeAddress'), 
                purchaserHomeCity = $purchaserHomeAddress.find('City').text(), 
                purchaserHomeState = $purchaserHomeAddress.find('State').text();
                
                var productOrder = {
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
                    'PrimaryEmail': purchaserPrimaryEmail, 
                    'HomeAddress': {
                      'City': purchaserHomeCity, 
                      'State': purchaserHomeState
                    }
                  }
                };
                
                productOrders.push(productOrder);
              });
              
              settings.success(productOrders);
            }
            
            if($records.length === 200) {
              var nextPageSettings = $.extend({}, settings);
              
              nextPageSettings.page = '' + (Number(settings.page) + 1);
              
              _this.getProductOrders(nextPageSettings);
            }
            else {
              settings.complete();
            }
          }
        }
      });
    }
  };
}]);