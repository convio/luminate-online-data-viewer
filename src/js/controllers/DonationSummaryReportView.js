dataViewerControllers.controller('DonationSummaryReportViewController', ['$scope', 'StorageService', 'DonationCampaignService', 'DonationFormService', 'DonationService', 'DateRangePickerService', 'DataTableService', function($scope, StorageService, DonationCampaignService, DonationFormService, DonationService, DateRangePickerService, DataTableService) {
  $.AdminLTE.layout.fix();
  
  $scope.updateTime = '';
  
  var refreshUpdateTime = function() {
    $scope.updateTime = 'Updated ' + moment().format('M/D/YYYY h:mma');
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  $scope.reportconfig = $.extend({
    datelabel: 'Last 24 Hours', 
    startdate: '', 
    enddate: '', 
    summaryinterval: 'hourly', 
    donationcampaign: '', 
    donationform: ''
  }, StorageService.getStoredData('reportconfig_donations_summary') || {});
  
  $('.daterangepicker').remove();
  
  DateRangePickerService.init('#report-config-datepicker', function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    updateDateRange(label);
  });
  
  var updateDateRange = function(label) {
    DateRangePickerService.getDatesForRange(label, function(start, end) {
      $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
      $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    });
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  $scope.donationcampaigns = [];
  
  var getDonationCampaigns = function() {
    DonationCampaignService.getDonationCampaigns({
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
      startDate: $scope.reportconfig.startdate, 
      endDate: $scope.reportconfig.enddate, 
      campaignId: $scope.reportconfig.donationcampaign, 
      formId: $scope.reportconfig.donationform, 
      success: function(donations) {
        if($scope.$location.path() === '/report-donations-summary') {
          DataTableService.destroy('.report-table');
          
          if(donations.length > 0) {
            $.each(donations, function() {
              addDonation(this);
            });
          }
          
          DataTableService.init('.report-table');
        }
      }, 
      complete: function() {
        if($scope.$location.path() === '/report-donations-summary') {
          refreshUpdateTime();
          
          $('.content .js--loading-overlay').addClass('hidden');
        }
      }
    });
  }, 
  
  addDonation = function(donation) {
    $scope.donations.push(donation);
    
    var paymentDate = donation.Payment.PaymentDate, 
    paymentHour = moment(paymentDate).format('YYYY-MM-DD[T]HH'), 
    paymentPeriod = paymentHour, 
    paymentAmount = Number(donation.Payment.Amount), 
    isRecurringPayment = donation.RecurringPayment ? true : false, 
    donationSumIndex = -1;
    
    switch($scope.reportconfig.summaryinterval) {
      case 'daily':
        paymentPeriod = moment(paymentDate).format('YYYY-MM-DD');
        break;
      case 'weekly':
        paymentPeriod = moment(paymentDate).startOf('week').format('YYYY-MM-DD');
        break;
      case 'monthly':
        paymentPeriod = moment(paymentDate).format('YYYY-MM');
        break;
    }
    
    $.each($scope.donationsums, function(sumIndex) {
      if(this.period === paymentPeriod) {
        donationSumIndex = sumIndex;
      }
    });
    
    if(donationSumIndex === -1) {
      var paymentPeriodFormatted = moment(paymentDate).format('MMM D, YYYY - h:00a');
      
      switch($scope.reportconfig.summaryinterval) {
        case 'daily':
          paymentPeriodFormatted = moment(paymentDate).format('MMM D, YYYY');
          break;
        case 'weekly':
          paymentPeriodFormatted = moment(paymentDate).startOf('week').format('[Week of] MMM D, YYYY');
          break;
        case 'monthly':
          paymentPeriodFormatted = moment(paymentDate).format('MMM YYYY');
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
    
    updateDateRange($scope.reportconfig.datelabel);
    
    DataTableService.destroy('.report-table');
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    getDonationSums();
  };
  
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