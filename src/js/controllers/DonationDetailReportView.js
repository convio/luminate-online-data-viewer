dataViewerControllers.controller('DonationDetailReportViewController', ['$scope', '$timeout', 'StorageService', 'DonationCampaignService', 'DonationFormService', 'DonationService', 'DateRangePickerService', 'DataTableService', function($scope, $timeout, StorageService, DonationCampaignService, DonationFormService, DonationService, DateRangePickerService, DataTableService) {
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
    startdate: moment().subtract(1, 'days'), 
    enddate: moment(), 
    donationcampaign: '', 
    donationform: ''
  }, StorageService.getStoredData('reportconfig_donations_detail') || {});
  
  $('.daterangepicker').remove();
  
  DateRangePickerService.init('#report-config-datepicker', function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    updateDateRange(start, end, label);
  });
  
  var updateDateRange = function(start, end, label) {
    if(label === 'Custom Range') {
      $scope.reportconfig.startdate = start;
      $scope.reportconfig.enddate = end;
    }
    else {
      DateRangePickerService.getDatesForRange(label, function(start, end) {
        $scope.reportconfig.startdate = start;
        $scope.reportconfig.enddate = end;
      });
    }
    
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
  
  var getDonations = function(options) {
    var campaignId = '', 
    formId = '';
    
    if($scope.reportconfig.donationcampaign && 
       $scope.reportconfig.donationcampaign !== '' && 
       $scope.reportconfig.donationcampaign.CampaignId) {
      campaignId = $scope.reportconfig.donationcampaign.CampaignId;
    }
    if($scope.reportconfig.donationform && 
       $scope.reportconfig.donationform !== '' && 
       $scope.reportconfig.donationform.FormId) {
      formId = $scope.reportconfig.donationform.FormId;
    }
    
    DonationService.getDonations({
      startDate: $scope.reportconfig.startdate.format('YYYY-MM-DD[T]HH:mm:ssZ'), 
      endDate: $scope.reportconfig.enddate.format('YYYY-MM-DD[T]HH:mm:ssZ'), 
      campaignId: campaignId, 
      formId: formId, 
      success: function(donations) {
        if($scope.$location.path() === '/report-donations-detail') {
          DataTableService.destroy('.report-table');
          
          if(donations.length > 0) {
            $.each(donations, function() {
              addDonation(this);
            });
          }
          
          DataTableService.init('.report-table', {
            'order': [
              [9, 'desc']
            ]
          });
        }
      }, 
      complete: function() {
        if($scope.$location.path() === '/report-donations-detail') {
          refreshUpdateTime();
          
          $('.content .js--loading-overlay').addClass('hidden');
        }
      }
    });
  }, 
  
  addDonation = function(donation) {
    $scope.donations.push(donation);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };
  
  getDonations();
  
  $scope.refreshReport = function() {
    $scope.donations = [];
    
    updateDateRange($scope.reportconfig.startdate, $scope.reportconfig.enddate, $scope.reportconfig.datelabel);
    
    DataTableService.destroy('.report-table');
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    getDonations();
  };
  
  $scope.blurReportConfigTypeAhead = function(e) {
    $timeout(function() {
      if($(e.target).is('.ng-invalid-editable')) {
        $(e.target).val('').change();
        $scope[$(e.target).data('ng-model')] = '';
      }
    }, 250);
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
                 this.Payment.Amount + ',' + 
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