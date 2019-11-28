dataViewerControllers.controller 'DonationDetailReportViewController', [
  '$scope'
  '$timeout'
  'StorageService'
  'DonationCampaignService'
  'DonationFormService'
  'DonationService'
  'DateRangePickerService'
  'DataTableService'
  ($scope, $timeout, StorageService, DonationCampaignService, DonationFormService, DonationService, DateRangePickerService, DataTableService) ->
    $.AdminLTE.layout.fix()
    
    $scope.updateTime = ''
    refreshUpdateTime = ->
      $scope.updateTime = 'Updated ' + moment().format('M/D/YYYY h:mma')
      if not $scope.$$phase
        $scope.$apply()
    
    $scope.reportconfig = $.extend
      datelabel: 'Last 24 Hours'
      startdate: moment().subtract 1, 'days'
      enddate: moment()
    , StorageService.getStoredData('reportconfig_donations_detail') or {}
    
    $('.daterangepicker').remove()
    DateRangePickerService.init '#report-config-datepicker', (start, end, label) ->
      $scope.reportconfig.datelabel = label
      updateDateRange start, end, label
    updateDateRange = (start, end, label) ->
      if label is 'Custom Range'
        $scope.reportconfig.startdate = start
        $scope.reportconfig.enddate = end
      else
        DateRangePickerService.getDatesForRange label, (start, end) ->
          $scope.reportconfig.startdate = start
          $scope.reportconfig.enddate = end
      if not $scope.$$phase
        $scope.$apply()
    
    $scope.donationcampaigns = []
    
    getDonationCampaigns = ->
      DonationCampaignService.getDonationCampaigns
        success: (donationCampaigns) ->
          if donationCampaigns.length > 0
            $.each donationCampaigns, ->
              addDonationCampaign this
    getDonationCampaigns()
    
    addDonationCampaign = (donationCampaign) ->
      $scope.donationcampaigns.push donationCampaign
      if not $scope.$$phase
        $scope.$apply()
    
    $scope.$watch 'reportconfig.donationcampaign', (newValue) ->
      if newValue isnt ''
        $scope.reportconfig.donationform = ''
    
    $scope.donationforms = []
    
    getDonationForms = ->
      DonationFormService.getDonationForms
        success: (donationForms) ->
          if donationForms.length > 0
            $.each donationForms, ->
              addDonationForm this
    getDonationForms()
    
    addDonationForm = (donationForm) ->
      $scope.donationforms.push donationForm
      if not $scope.$$phase
        $scope.$apply()
    
    $scope.donations = []
    
    getDonations = (options) ->
      campaignId = ''
      formId = ''
      if $scope.reportconfig.donationcampaign and $scope.reportconfig.donationcampaign isnt '' and $scope.reportconfig.donationcampaign.CampaignId
        campaignId = $scope.reportconfig.donationcampaign.CampaignId
      if $scope.reportconfig.donationform and $scope.reportconfig.donationform isnt '' and $scope.reportconfig.donationform.FormId
        formId = $scope.reportconfig.donationform.FormId
      DonationService.getDonations
        startDate: $scope.reportconfig.startdate.format 'YYYY-MM-DD[T]HH:mm:ssZ'
        endDate: $scope.reportconfig.enddate.format 'YYYY-MM-DD[T]HH:mm:ssZ'
        campaignId: campaignId
        formId: formId
        success: (donations) ->
          if $scope.$location.path() is '/report-donations-detail'
            DataTableService.destroy '.report-table'
            if donations.length > 0
              $.each donations, ->
                addDonation this
            DataTableService.init '.report-table',
              'order': [
                [9, 'desc']
              ]
        complete: ->
          if $scope.$location.path() is '/report-donations-detail'
            refreshUpdateTime()
            $('.content .js--loading-overlay').addClass 'hidden'
    getDonations()
    
    addDonation = (donation) ->
      $scope.donations.push donation
      if not $scope.$$phase
        $scope.$apply()
    
    $scope.refreshReport = ->
      $scope.donations = []
      updateDateRange $scope.reportconfig.startdate, $scope.reportconfig.enddate, $scope.reportconfig.datelabel
      DataTableService.destroy '.report-table'
      $('.content .js--loading-overlay').removeClass 'hidden'
      getDonations()
    
    $scope.blurReportConfigTypeAhead = (e) ->
      $timeout ->
        if $(e.target).is('.ng-invalid-editable')
          $(e.target).val('').change()
          $scope[$(e.target).data('ng-model')] = ''
      , 250
    
    $scope.updateReportConfig = (e) ->
      $('#report-config-modal').modal 'hide'
      StorageService.storeData 'reportconfig_donations_detail', $scope.reportconfig, true
      $scope.refreshReport()
    
    $scope.download = ->
      csvData = 'Transaction ID,Campaign,Form,Donation Amount,First Name,Last Name,Email Address,City,State,Donation Date,Donation Type,Payment Type'
      $.each $scope.donations, ->
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
                   this.Payment._TenderTypeFormatted
      $('.js--report-save-as').off('change').on 'change', ->
        require('fs').writeFile $(this).val(), csvData, (error) ->
          if error
            angular.noop()
      .click()
]