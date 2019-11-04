dataViewerApp.factory('DonationService', ['WebServicesService', function(WebServicesService) {
  return {
    getDonations: function(options) {
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
        statement: 'select TransactionId, CampaignId, FormId,' + 
                   ' Payment.Amount, Payment.PaymentDate, Payment.TenderType, Payment.CreditCardType,' + 
                   ' Donor.ConsName.FirstName, Donor.ConsName.LastName,' + 
                   ' Donor.PrimaryEmail,' + 
                   ' Donor.HomeAddress.City, Donor.HomeAddress.State,' + 
                   ' RecurringPayment.OriginalTransactionId' + 
                   ' from Donation' + 
                   ' where Payment.PaymentDate &gt;= ' + settings.startDate + 
                   ' and Payment.PaymentDate &lt;=' + settings.endDate + 
                   (settings.campaignId && settings.campaignId !== '' ? (' and CampaignId = ' + settings.campaignId) : '') + 
                   (settings.formId && settings.formId !== '' ? (' and FormId = ' + settings.formId) : ''), 
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
            var donations = [], 
            $records = $(response).find('Record');
            
            if($records.length === 0) {
              settings.success(donations);
            }
            else {
              $records.each(function() {
                var transactionId = $(this).find('ens\\:TransactionId').text(), 
                campaignId = $(this).find('ens\\:CampaignId').text(), 
                formId = $(this).find('ens\\:FormId').text(), 
                $payment = $(this).find('ens\\:Payment'), 
                paymentAmount = Number($payment.find('ens\\:Amount').text()), 
                paymentAmountFormatted = paymentAmount.toLocaleString('en', {
                  style: 'currency', 
                  currency: 'USD', 
                  minimumFractionDigits: 2
                }), 
                paymentDate = $payment.find('ens\\:PaymentDate').text(), 
                paymentDateFormatted = moment(paymentDate).format('MM/DD/YYYY h:mma'), 
                paymentTenderType = $payment.find('ens\\:TenderType').text(), 
                paymentTenderTypeFormatted = '', 
                paymentCreditCardType = $payment.find('ens\\:CreditCardType').text(), 
                $donor = $(this).find('ens\\:Donor'), 
                $donorName = $donor.find('ens\\:ConsName'), 
                donorFirstName = $donorName.find('ens\\:FirstName').text(), 
                donorLastName = $donorName.find('ens\\:LastName').text(), 
                donorPrimaryEmail = $donor.find('ens\\:PrimaryEmail').text(), 
                $donorHomeAddress = $(this).find('ens\\:HomeAddress'), 
                donorHomeCity = $donorHomeAddress.find('ens\\:City').text(), 
                donorHomeState = $donorHomeAddress.find('ens\\:State').text(), 
                $recurringPayment = $(this).find('ens\\:RecurringPayment'), 
                originalTransactionId = transactionId, 
                donationType = 'One-Time';
                
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
                
                if($recurringPayment.length > 0) {
                  donationType = 'Sustaining';
                }
                
                var donation = {
                  'TransactionId': transactionId, 
                  'CampaignId': campaignId, 
                  'FormId': formId, 
                  'Payment': {
                    'Amount': paymentAmount, 
                    '_AmountFormatted': paymentAmountFormatted, 
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
                    'PrimaryEmail': donorPrimaryEmail, 
                    'HomeAddress': {
                      'City': donorHomeCity, 
                      'State': donorHomeState
                    }
                  }, 
                  '_DonationType': donationType
                };
                
                if($recurringPayment.length > 0) {
                  originalTransactionId = $recurringPayment.find('ens\\:OriginalTransactionId').text();
                  
                  donation.RecurringPayment = {
                    'OriginalTransactionId': originalTransactionId
                  };
                }
                
                donations.push(donation);
              });
              
              settings.success(donations);
            }
            
            if($records.length === 200) {
              var nextPageSettings = $.extend({}, settings);
              
              nextPageSettings.page = '' + (Number(settings.page) + 1);
              
              _this.getDonations(nextPageSettings);
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