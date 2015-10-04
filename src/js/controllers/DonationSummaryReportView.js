dataViewerControllers.controller('DonationSummaryReportViewController', ['$scope', 'WebServicesService', function($scope, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.donationcampaigns = [];
  
  var addDonationCampaign = function(donationCampaign) {
    $scope.donationcampaigns.push(donationCampaign);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getDonationCampaigns = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {});
    
    WebServicesService.query({
      statement: 'select CampaignId, Title from DonationCampaign', 
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
              var campaignId = $(this).find('CampaignId').text(), 
              campaignTitle = $(this).find('Title').text();
              
              var campaignData = {
                'CampaignId': campaignId, 
                'Title': campaignTitle
              };
              
              addDonationCampaign(campaignData);
            });
          }
          
          if($records.length === 200) {
            getDonationCampaigns({
              page: '' + (Number(settings.page) + 1)
            });
          }
          else {
            /* TODO */
          }
        }
      }
    });
  };
  
  getDonationCampaigns();
  
  $scope.donationforms = [];
  
  var addDonationForm = function(donationForm) {
    $scope.donationforms.push(donationForm);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getDonationForms = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {});
    
    WebServicesService.query({
      statement: 'select FormId, CampaignId, Title from DonationForm', 
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
              var formId = $(this).find('FormId').text(), 
              campaignId = $(this).find('CampaignId').text(), 
              formTitle = $(this).find('Title').text();
              
              var formData = {
                'FormId': formId, 
                'CampaignId': campaignId, 
                'Title': formTitle
              };
              
              addDonationForm(formData);
            });
          }
          
          if($records.length === 200) {
            getDonationForms({
              page: '' + (Number(settings.page) + 1)
            });
          }
          else {
            /* TODO */
          }
        }
      }
    });
  };
  
  getDonationForms();
  
  $scope.donations = [];
  
  $scope.donationsums = [];
  
  var addDonation = function(donation) {
    $scope.donations.push(donation);
    
    var paymentDate = donation.Payment.PaymentDate, 
    paymentPeriod = paymentDate.split(':')[0], 
    paymentAmount = Number(donation.Payment.Amount), 
    isRecurringPayment = donation.RecurringPayment ? true : false, 
    donationSumIndex = -1;
    
    $.each($scope.donationsums, function(sumIndex) {
      if(this.period === paymentPeriod) {
        donationSumIndex = sumIndex;
      }
    });
    
    if(donationSumIndex === -1) {
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
        amount: 0, 
        amountFormatted: '$0.00', 
        oneTimeCount: 0, 
        oneTimeAmount: 0, 
        oneTimeAmountFormatted: '$0.00', 
        recurringCount: 0, 
        recurringAmount: 0, 
        recurringAmountFormatted: '$0.00'
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
    
    if(!isRecurringPayment) {
      $scope.donationsums[donationSumIndex].oneTimeCount = $scope.donationsums[donationSumIndex].oneTimeCount + 1;
      $scope.donationsums[donationSumIndex].oneTimeAmount = Number($scope.donationsums[donationSumIndex].oneTimeAmount) + paymentAmount;
      $scope.donationsums[donationSumIndex].oneTimeAmountFormatted = $scope.donationsums[donationSumIndex].oneTimeAmount.toLocaleString('en', {
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 2
      });
    }
    else {
      $scope.donationsums[donationSumIndex].recurringCount = $scope.donationsums[donationSumIndex].recurringCount + 1;
      $scope.donationsums[donationSumIndex].recurringAmount = Number($scope.donationsums[donationSumIndex].recurringAmount) + paymentAmount;
      $scope.donationsums[donationSumIndex].recurringAmountFormatted = $scope.donationsums[donationSumIndex].recurringAmount.toLocaleString('en', {
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 2
      });
    }
    
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
      statement: 'select TransactionId, Payment.Amount, Payment.PaymentDate, RecurringPayment.OriginalTransactionId from Donation where Payment.PaymentDate >= ' + oneDayAgo, 
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
              paymentDate = $payment.find('PaymentDate').text(), 
              $recurringPayment = $(this).find('RecurringPayment');
              
              var donationData = {
                'TransactionId': transactionId, 
                'Payment': {
                  'Amount': paymentAmount, 
                  'PaymentDate': paymentDate
                }
              };
              
              if($recurringPayment.length > 0) {
                var originalTransactionId = $recurringPayment.find('OriginalTransactionId');
                
                donationData.RecurringPayment = {
                  'OriginalTransactionId': originalTransactionId
                };
              }
              
              addDonation(donationData);
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
  
  $scope.download = function() {
    var csvData = 'Time Period,One-Time Count,One-Time Amount,Sustaining Count,Sustaining Amount,Total Count,Total Amount';
    $.each($scope.donationsums, function() {
      csvData += '\n' + 
                 '"' + this.periodFormatted + '",' + 
                 this.oneTimeCount + ',' + 
                 this.oneTimeAmountFormatted + ',' + 
                 this.recurringCount + ',' + 
                 this.recurringAmountFormatted + ',' + 
                 this.count + ',' + 
                 this.amountFormatted;
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