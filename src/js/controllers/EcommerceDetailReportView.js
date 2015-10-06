dataViewerControllers.controller('EcommerceDetailReportViewController', ['$scope', 'CacheService', 'WebServicesService', function($scope, CacheService, WebServicesService) {
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
    enddate: ''
  }, CacheService.getCachedReportConfig('report_ecommerce_detail'));
  
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
      statement: 'select TransactionId, StoreId,' + 
                 ' Payment.Amount, Payment.PaymentDate,' + 
                 ' Purchaser.ConsName.FirstName, Purchaser.ConsName.LastName, Purchaser.PrimaryEmail, Purchaser.HomeAddress.City, Purchaser.HomeAddress.State,' + 
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
              purchaserPrimaryEmail = $purchaser.find('PrimaryEmail').text(), 
              $purchaserHomeAddress = $(this).find('HomeAddress'), 
              purchaserHomeCity = $purchaserHomeAddress.find('City').text(), 
              purchaserHomeState = $purchaserHomeAddress.find('State').text();
              
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
                  'PrimaryEmail': purchaserPrimaryEmail, 
                  'HomeAddress': {
                    'City': purchaserHomeCity, 
                    'State': purchaserHomeState
                  }
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
              [8, 'desc']
            ], 
            'info': true, 
            'autoWidth': false
          });
          
          if($records.length === 200) {
            getOrders({
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
  
  getOrders();
  
  $scope.refreshReport = function() {
    $scope.orders = [];
    
    $('.report-table').DataTable().destroy();
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    getOrders();
  };
  
  $scope.updateReportConfig = function(e) {
    $('#report-config-modal').modal('hide');
    
    CacheService.cacheReportConfig('report_ecommerce_detail', $scope.reportconfig);
    
    $scope.refreshReport();
  };
  
  $scope.download = function() {
    var csvData = 'Transaction ID,Store ID,Order Amount,First Name,Last Name,Email Address,City,State,Order Date';
    $.each($scope.orders, function() {
      csvData += '\n' + 
                 this.TransactionId + ',' + 
                 this.StoreId + ',' + 
                 this.Payment._AmountFormatted + ',' + 
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