dataViewerControllers.controller('DonationDetailReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.donations = [];
  
  var addDonation = function(donation) {
    $scope.donations.push(donation);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getDonations = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {}), 
    
    now = new Date(), 
    oneDayAgo = new Date(now - (24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
    
    WebServicesService.query({
      statement: 'select TransactionId, CampaignId, FormId, Payment.Amount, Payment.PaymentDate, Payment.TenderType, Payment.CreditCardType, Donor.ConsName, Donor.PrimaryEmail from Donation where Payment.PaymentDate >= ' + oneDayAgo, 
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
              campaignId = $(this).find('CampaignId').text(), 
              formId = $(this).find('FormId').text(), 
              $payment = $(this).find('Payment'), 
              paymentAmount = $payment.find('Amount').text(), 
              paymentDate = $payment.find('PaymentDate').text(), 
              paymentDateFormatted = new Intl.DateTimeFormat().format(new Date(paymentDate)), 
              paymentTenderType = $payment.find('TenderType').text(), 
              paymentTenderTypeFormatted = '', 
              paymentCreditCardType = $payment.find('CreditCardType').text(), 
              $donor = $(this).find('Donor'), 
              $donorName = $donor.find('ConsName'), 
              donorFirstName = $donorName.find('FirstName').text(), 
              donorLastName = $donorName.find('LastName').text(), 
              donorPrimaryEmail = $donor.find('PrimaryEmail').text();
              
              switch(paymentTenderType.toLowerCase()) {
                case 'credit_card':
                  paymentTenderTypeFormatted = 'Credit';
                  break;
                case 'check':
                  paymentTenderTypeFormatted = 'Check';
                  break;
                case 'cash':
                  paymentTenderTypeFormatted = 'Cash';
                  break;
                case 'ach':
                  paymentTenderTypeFormatted = 'ACH';
                  break;
                case 'x_checkout':
                  if(paymentCreditCardType.toLowerCase() === 'paypal') {
                    paymentTenderTypeFormatted = 'PayPal';
                  }
                  else {
                    paymentTenderTypeFormatted = 'X-Checkout';
                  }
                  break;
              }
              
              addDonation({
                'TransactionId': transactionId, 
                'CampaignId': campaignId, 
                'FormId': formId, 
                'Payment': {
                  'Amount': paymentAmount, 
                  'PaymentDate': paymentDate, 
                  '_PaymentDateFormatted': paymentDateFormatted, 
                  'TenderType': paymentTenderType, 
                  '_TenderTypeFormatted': paymentTenderTypeFormatted
                }, 
                'Donor': {
                  'ConsName': {
                    'FirstName': donorFirstName, 
                    'LastName': donorLastName
                  }, 
                  'PrimaryEmail': donorPrimaryEmail
                }
              });
            });
          }
          
          if($records.length === 200) {
            getDonations({
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
  
  getDonations();
}]);