dataViewerControllers.controller('DonationsReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.donations = [];
  
  var addDonation = function(donation) {
    $scope.donations.push(donation);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  now = new Date(), 
  oneMonthAgo = new Date(now - (30 * 24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
  
  WebServicesService.query({
    statement: 'select Payment.Amount, Payment.PaymentDate, Donor.ConsName, Donor.PrimaryEmail from Donation where Payment.PaymentDate >= ' + oneMonthAgo, 
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
          $donor = $(this).find('Donor'), 
          $donorName = $donor.find('ConsName'), 
          donorFirstName = $donorName.find('FirstName').text(), 
          donorLastName = $donorName.find('LastName').text(), 
          donorPrimaryEmail = $donor.find('PrimaryEmail').text();
          
          addDonation({
            Payment: {
              Amount: paymentAmount, 
              PaymentDate: paymentDate
            }, 
            Donor: {
              ConsName: {
                FirstName: donorFirstName, 
                LastName: donorLastName
              }, 
              PrimaryEmail: donorPrimaryEmail
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