dataViewerControllers.controller('DonationDetailReportViewController', ['$scope', 'StorageService', 'DonationCampaignService', 'DonationFormService', 'DonationService', 'DateRangePickerService', 'DataTableService', function($scope, StorageService, DonationCampaignService, DonationFormService, DonationService, DateRangePickerService, DataTableService) {
  $.AdminLTE.layout.fix();
  
  $('.daterangepicker').remove();
  
  DateRangePickerService.init('#report-config-datepicker', function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    DateRangePickerService.getDatesForRange(label, function(start, end) {
      $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
      $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    });
    
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
  
  var getDonations = function(options) {
    DonationService.getDonations({
      success: function(donations) {
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
      }, 
      complete: function() {
        $('.content .js--loading-overlay').addClass('hidden');
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
    
    DateRangePickerService.getDatesForRange($scope.reportconfig.datelabel, function(start, end) {
      $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
      $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    });
    
    DataTableService.destroy('.report-table');
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    getDonations();
  };
  
  /* TODO: resetReportConfig */
  
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