dataViewerControllers.controller('DonationDetailReportViewController', ['$scope', 'DateRangePickerService', 'StorageService', 'WebServicesService', function($scope, DateRangePickerService, StorageService, WebServicesService) {
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
    enddate: '', 
    donationcampaign: '', 
    donationform: ''
  }, StorageService.getStoredData('reportconfig_donations_detail') || {});
  
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
      statement: 'select CampaignId, Title, IsArchived from DonationCampaign', 
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
              campaignTitle = $(this).find('Title').text(), 
              campaignIsArchived = $(this).find('IsArchived').text() === 'true';
              
              var campaignData = {
                'CampaignId': campaignId, 
                'Title': campaignTitle, 
                'IsArchived': campaignIsArchived
              };
              
              addDonationCampaign(campaignData);
            });
          }
          
          if($records.length === 200) {
            getDonationCampaigns({
              page: '' + (Number(settings.page) + 1)
            });
          }
        }
      }
    });
  };
  
  getDonationCampaigns();
  
  $scope.$watch('reportconfig.donationcampaign', function(newValue) {
    if(newValue !== '') {
      $scope.reportconfig.donationform = '';
    }
  });

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
      statement: 'select FormId, CampaignId, Title, IsPublished, IsArchived from DonationForm', 
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
              formTitle = $(this).find('Title').text(), 
              formIsPublished = $(this).find('IsPublished').text() === 'true', 
              formIsArchived = $(this).find('IsArchived').text() === 'true';
              
              var formData = {
                'FormId': formId, 
                'CampaignId': campaignId, 
                'Title': formTitle, 
                'IsPublished': formIsPublished, 
                'IsArchived': formIsArchived
              };
              
              addDonationForm(formData);
            });
          }
          
          if($records.length === 200) {
            getDonationForms({
              page: '' + (Number(settings.page) + 1)
            });
          }
        }
      }
    });
  };
  
  getDonationForms();
  
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
    startDate = moment().subtract(1, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ'), 
    endDate = moment().format('YYYY-MM-DD[T]HH:mm:ssZ'), 
    campaignId, 
    formId;
    
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
    
    if($scope.reportconfig.donationcampaign !== '') {
      campaignId = $scope.reportconfig.donationcampaign;
    }
    
    if($scope.reportconfig.donationform !== '') {
      formId = $scope.reportconfig.donationform;
    }
    
    WebServicesService.query({
      statement: 'select TransactionId, CampaignId, FormId,' + 
                 ' Payment.Amount, Payment.PaymentDate, Payment.TenderType, Payment.CreditCardType,' + 
                 ' Donor.ConsName.FirstName, Donor.ConsName.LastName, Donor.PrimaryEmail, Donor.HomeAddress.City, Donor.HomeAddress.State,' + 
                 ' RecurringPayment.OriginalTransactionId, RecurringPayment.Duration' + 
                 ' from Donation' + 
                 ' where Payment.PaymentDate &gt;= ' + startDate + ' and Payment.PaymentDate &lt;=' + endDate + 
                 (campaignId ? (' and CampaignId = ' + campaignId) : '') + 
                 (formId ? (' and FormId = ' + formId) : ''), 
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
              campaignId = $(this).find('CampaignId').text(), 
              formId = $(this).find('FormId').text(), 
              $payment = $(this).find('Payment'), 
              paymentAmount = Number($payment.find('Amount').text()), 
              paymentAmountFormatted = paymentAmount.toLocaleString('en', {
                style: 'currency', 
                currency: 'USD', 
                minimumFractionDigits: 2
              }), 
              paymentDate = $payment.find('PaymentDate').text(), 
              paymentDateFormatted = moment(paymentDate).format('MM/DD/YYYY h:mma'), 
              paymentTenderType = $payment.find('TenderType').text(), 
              paymentTenderTypeFormatted = '', 
              paymentCreditCardType = $payment.find('CreditCardType').text(), 
              $donor = $(this).find('Donor'), 
              $donorName = $donor.find('ConsName'), 
              donorFirstName = $donorName.find('FirstName').text(), 
              donorLastName = $donorName.find('LastName').text(), 
              donorPrimaryEmail = $donor.find('PrimaryEmail').text(), 
              $donorHomeAddress = $(this).find('HomeAddress'), 
              donorHomeCity = $donorHomeAddress.find('City').text(), 
              donorHomeState = $donorHomeAddress.find('State').text(), 
              $recurringPayment = $(this).find('RecurringPayment'), 
              originalTransactionId = transactionId, 
              paymentDuration = 1, 
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
              
              var donationData = {
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
                originalTransactionId = $recurringPayment.find('OriginalTransactionId').text();
                paymentDuration = Number($recurringPayment.find('Duration').text());
                
                donationData.RecurringPayment = {
                  'OriginalTransactionId': originalTransactionId, 
                  'Duration': paymentDuration
                };
              }
              
              addDonation(donationData);
            });
          }
          
          $('.report-table').DataTable({
            'searching': false, 
            'info': true, 
            'paging': true, 
            'lengthChange': false, 
            'ordering': true, 
            'order': [
              [9, 'desc']
            ], 
            'autoWidth': false, 
            'dom': '<".table-responsive"t>ip'
          });
          
          if($records.length === 200) {
            getDonations({
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
  
  getDonations();
  
  $scope.refreshReport = function() {
    $scope.donations = [];
    
    $('.report-table').DataTable().destroy();
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    $('.daterangepicker .applyBtn').click();

    getDonations();
  };
  
  $scope.updateReportConfig = function(e) {
    $('#report-config-modal').modal('hide');
    
    StorageService.storeData('reportconfig_donations_detail', $scope.reportconfig, true);
    
    $scope.refreshReport();
  };
  
  $scope.download = function() {
    var csvData = 'Transaction ID,Campaign,Form,Donation Amount,First Name,Last Name,Email Address,City,State,Donation Date,Donation Type,Payment Type';
    $.each($scope.donations, function() {
      csvData += '\n' + 
                 this.TransactionId + ',' + 
                 this.CampaignId + ',' + 
                 this.FormId + ',' + 
                 this.Payment._AmountFormatted + ',' + 
                 '"' + this.Donor.ConsName.FirstName.replace(/"/g, '""') + '",' + 
                 '"' + this.Donor.ConsName.LastName.replace(/"/g, '""') + '",' + 
                 this.Donor.PrimaryEmail + ',' + 
                 this.Donor.HomeAddress.City + ',' + 
                 this.Donor.HomeAddress.State + ',' + 
                 this.Payment._PaymentDateFormatted + ',' + 
                 this._DonationType + ',' + 
                 this.Payment._TenderTypeFormatted;
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