dataViewerControllers.controller('DonationSummaryReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.donations = [];
  
  $scope.donationsums = [];
  
  var addDonation = function(donation) {
    $scope.donations.push(donation);
    
    var paymentDate = donation.Payment.PaymentDate, 
    paymentPeriod = paymentDate.split(':')[0], 
    paymentAmount = Number(donation.Payment.Amount), 
    donationSumIndex;
    
    $.each($scope.donationsums, function(sumIndex) {
      if(this.period === paymentPeriod) {
        donationSumIndex = sumIndex;
      }
    });
    
    if(!donationSumIndex) {
      var paymentPeriodFormatted = new Intl.DateTimeFormat('en-us', {
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      }).format(new Date(paymentPeriod + ':00:00Z')) + ' - ' + new Intl.DateTimeFormat('en-us', {
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit'
      }).format(new Date(paymentPeriod + ':00:00Z'));
      
      $scope.donationsums.push({
        period: paymentPeriod, 
        periodFormatted: paymentPeriodFormatted, 
        count: 0, 
        amount: 0
      });
      
      donationSumIndex = $scope.donationsums.length - 1;
    }
    
    $scope.donationsums[donationSumIndex].count = $scope.donationsums[donationSumIndex].count + 1;
    
    $scope.donationsums[donationSumIndex].amount = Number($scope.donationsums[donationSumIndex].amount) + paymentAmount;
    
    $scope.donationsums[donationSumIndex].amountFormatted = $scope.donationsums[donationSumIndex].amount.toLocaleString('en', {
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 2
    });
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getDonationSums = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {}), 
    
    now = new Date(), 
    oneDayAgo = new Date(now - (24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
    
    WebServicesService.query({
      statement: 'select TransactionId, Payment.Amount, Payment.PaymentDate from Donation where Payment.PaymentDate >= ' + oneDayAgo, 
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
              
              addDonation({
                'TransactionId': transactionId, 
                'Payment': {
                  'Amount': paymentAmount, 
                  'PaymentDate': paymentDate
                }
              });
            });
          }
          
          if($records.length === 200) {
            getDonationSums({
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
  
  getDonationSums();
}]);