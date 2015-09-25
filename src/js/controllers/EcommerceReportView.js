dataViewerControllers.controller('EcommerceReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.orders = [];
  
  var addOrder = function(order) {
    $scope.orders.push(order);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  now = new Date(), 
  oneMonthAgo = new Date(now - (30 * 24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
  
  WebServicesService.query({
    statement: 'select Payment.Amount, Payment.PaymentDate, Purchaser.ConsName, Purchaser.PrimaryEmail from ProductOrder where Payment.PaymentDate >= ' + oneMonthAgo, 
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
        
        $records.each(function() {
          var $payment = $(this).find('Payment'), 
          paymentAmount = $payment.find('Amount').text(), 
          paymentDate = $payment.find('PaymentDate').text(), 
          $purchaser = $(this).find('Purchaser'), 
          $purchaserName = $purchaser.find('ConsName'), 
          purchaserFirstName = $purchaserName.find('FirstName').text(), 
          purchaserLastName = $purchaserName.find('LastName').text(), 
          purchaserPrimaryEmail = $purchaser.find('PrimaryEmail').text();
          
          addOrder({
            Payment: {
              Amount: paymentAmount, 
              PaymentDate: paymentDate
            }, 
            Purchaser: {
              ConsName: {
                FirstName: purchaserFirstName, 
                LastName: purchaserLastName
              }, 
              PrimaryEmail: purchaserPrimaryEmail
            }
          });
        });
        
        $('.report-table').DataTable({
          'paging': true, /* TODO: only paginate if there are more results than one page */
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
  });
}]);