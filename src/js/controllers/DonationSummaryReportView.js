dataViewerControllers.controller('DonationSummaryReportViewController', ['$scope', 'StorageService', 'DonationCampaignService', 'DonationFormService', 'DonationService', 'DateRangePickerService', 'DataTableService', function($scope, StorageService, DonationCampaignService, DonationFormService, DonationService, DateRangePickerService, DataTableService) {
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
    summaryinterval: 'hourly', 
    donationcampaign: '', 
    donationform: ''
  }, StorageService.getStoredData('reportconfig_donations_summary') || {});
  
  $scope.donationcampaigns = [];
  
  var getDonationCampaigns = function() {
    DonationCampaignService.getDonationCampaigns({
      startDate: $scope.reportconfig.startdate, 
      endDate: $scope.reportconfig.enddate, 
      campaignId: $scope.reportconfig.donationcampaign, 
      formId: $scope.reportconfig.donationform, 
      success: function(donationCampaigns) {
        if(donationCampaigns.length > 0) {
          $.each(donationCampaigns, function() {
            addDonationCampaign(this);
          });
        }
      }
    });
  }, 
  
  addDonationCampaign = function(donationCampaign) {
    $scope.donationcampaigns.push(donationCampaign);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  getDonationCampaigns();
  
  $scope.$watch('reportconfig.donationcampaign', function(newValue) {
    if(newValue !== '') {
      $scope.reportconfig.donationform = '';
    }
  });
  
  $scope.donationforms = [];
  
  var getDonationForms = function() {
    DonationFormService.getDonationForms({
      success: function(donationForms) {
        if(donationForms.length > 0) {
          $.each(donationForms, function() {
            addDonationForm(this);
          });
        }
      }
    });
  }, 
  
  addDonationForm = function(donationForm) {
    $scope.donationforms.push(donationForm);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  getDonationForms();
  
  $scope.donations = [];
  
  $scope.donationsums = [];
  
  var getDonationSums = function(options) {
    DonationService.getDonations({
      success: function(donations) {
        DataTableService.destroy('.report-table');
        
        if(donations.length > 0) {
          $.each(donations, function() {
            addDonation(this);
          });
        }
        
        DataTableService.init('.report-table');
      }, 
      complete: function() {
        $('.content .js--loading-overlay').addClass('hidden');
      }
    });
  }, 
  
  addDonation = function(donation) {
    $scope.donations.push(donation);
    
    var paymentDate = donation.Payment.PaymentDate, 
    paymentHour = paymentDate.split(':')[0], 
    paymentPeriod = paymentHour, 
    paymentAmount = Number(donation.Payment.Amount), 
    isRecurringPayment = donation.RecurringPayment ? true : false, 
    donationSumIndex = -1;
    
    switch($scope.reportconfig.summaryinterval) {
      case 'daily':
        paymentPeriod = paymentPeriod.split('T')[0];
        break;
      case 'weekly':
        /* TODO */
        break;
      case 'monthly':
        paymentPeriod = paymentPeriod.split('T')[0].split('-')[0] + paymentPeriod.split('T')[0].split('-')[1];
        break;
    }
    
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
      }).format(new Date(paymentHour + ':00:00Z')) + ' - ' + new Intl.DateTimeFormat('en-us', {
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit'
      }).format(new Date(paymentHour + ':00:00Z'));
      
      switch($scope.reportconfig.summaryinterval) {
        case 'daily':
          paymentPeriodFormatted = Intl.DateTimeFormat('en-us', {
            month: 'short', 
            day: 'numeric', 
            year: 'numeric'
          }).format(new Date(paymentHour + ':00:00Z'));
          break;
        case 'weekly':
          /* TODO */
          break;
        case 'monthly':
          paymentPeriodFormatted = Intl.DateTimeFormat('en-us', {
            month: 'short', 
            year: 'numeric'
          }).format(new Date(paymentHour + ':00:00Z'));
          break;
      }
      
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
  };
  
  getDonationSums();
  
  $scope.refreshReport = function() {
    $scope.donations = [];
    
    $scope.donationsums = [];
    
    DataTableService.destroy('.report-table');
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    $('.daterangepicker .applyBtn').click();
    
    getDonationSums();
  };
  
  /* TODO: resetReportConfig */
  
  $scope.updateReportConfig = function(e) {
    $('#report-config-modal').modal('hide');
    
    StorageService.storeData('reportconfig_donations_summary', $scope.reportconfig, true);
    
    $scope.refreshReport();
  };
  
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