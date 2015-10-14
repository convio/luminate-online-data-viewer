dataViewerControllers.controller('EcommerceDetailReportViewController', ['$scope', 'DateRangePickerService', 'StorageService', 'WebServicesService', function($scope, DateRangePickerService, StorageService, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $('.daterangepicker').remove();
  
  DateRangePickerService.init('#report-config-datepicker', function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
    $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });
  
  $scope.reportconfig = $.extend({
    datelabel: 'Last 24 Hours', 
    startdate: '', 
    enddate: ''
  }, StorageService.getStoredData('reportconfig_ecommerce_detail') || {});
  
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
    startDate = moment().subtract(1, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ'), 
    endDate = moment().format('YYYY-MM-DD[T]HH:mm:ssZ');
    
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
          
          if($records.length !== 0) {
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
            'searching': false, 
            'info': true, 
            'paging': true, 
            'lengthChange': false, 
            'ordering': true, 
            'order': [
              [8, 'desc']
            ], 
            'autoWidth': false, 
            'dom': '<".table-responsive"t>ip'
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
    
    $('.daterangepicker .applyBtn').click();

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