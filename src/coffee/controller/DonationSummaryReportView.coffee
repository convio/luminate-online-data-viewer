angular.module 'dataViewerControllers'
  .controller 'DonationSummaryReportViewController', [
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
        summaryinterval: 'hourly'
        donationcampaign: ''
        donationform: ''
      , StorageService.getStoredData('reportconfig_donations_summary') or {}
      
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
      $scope.donationsums = []
      
      getDonationSums = (options) ->
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
            if $scope.$location.path() is '/report-donations-summary'
              DataTableService.destroy '.report-table'
              if donations.length > 0
                $.each donations, ->
                  addDonation this
              DataTableService.init '.report-table'
          complete: ->
            if $scope.$location.path() is '/report-donations-summary'
              refreshUpdateTime()
              $('.content .js--loading-overlay').addClass 'hidden'
      getDonationSums()
      
      addDonation = (donation) ->
        $scope.donations.push donation
        paymentDate = donation.Payment.PaymentDate
        paymentHour = moment(paymentDate).format 'YYYY-MM-DD[T]HH'
        paymentPeriod = paymentHour
        paymentAmount = Number donation.Payment.Amount
        isRecurringPayment = donation.RecurringPayment ? true : false
        donationSumIndex = -1
        switch $scope.reportconfig.summaryinterval
          when 'daily'
            paymentPeriod = moment(paymentDate).format 'YYYY-MM-DD'
          when 'weekly'
            paymentPeriod = moment(paymentDate).startOf('week').format 'YYYY-MM-DD'
          when 'monthly'
            paymentPeriod = moment(paymentDate).format 'YYYY-MM'
        $.each $scope.donationsums, (sumIndex) ->
          if this.period is paymentPeriod
            donationSumIndex = sumIndex
        if donationSumIndex is -1
          paymentPeriodFormatted = moment(paymentDate).format 'MMM D, YYYY - h:00a'
          switch $scope.reportconfig.summaryinterval
            when 'daily'
              paymentPeriodFormatted = moment(paymentDate).format 'MMM D, YYYY'
            when 'weekly'
              paymentPeriodFormatted = moment(paymentDate).startOf('week').format '[Week of] MMM D, YYYY'
            when 'monthly'
              paymentPeriodFormatted = moment(paymentDate).format 'MMM YYYY'
          $scope.donationsums.push
            period: paymentPeriod
            periodFormatted: paymentPeriodFormatted
            count: 0
            amount: 0
            amountFormatted: '$0.00'
            oneTimeCount: 0
            oneTimeAmount: 0
            oneTimeAmountFormatted: '$0.00'
            recurringCount: 0
            recurringAmount: 0
            recurringAmountFormatted: '$0.00'
          donationSumIndex = $scope.donationsums.length - 1
        $scope.donationsums[donationSumIndex].count = $scope.donationsums[donationSumIndex].count + 1
        $scope.donationsums[donationSumIndex].amount = Number($scope.donationsums[donationSumIndex].amount) + paymentAmount
        $scope.donationsums[donationSumIndex].amountFormatted = $scope.donationsums[donationSumIndex].amount.toLocaleString 'en',
          style: 'currency'
          currency: 'USD'
          minimumFractionDigits: 2
        if not isRecurringPayment
          $scope.donationsums[donationSumIndex].oneTimeCount = $scope.donationsums[donationSumIndex].oneTimeCount + 1
          $scope.donationsums[donationSumIndex].oneTimeAmount = Number($scope.donationsums[donationSumIndex].oneTimeAmount) + paymentAmount
          $scope.donationsums[donationSumIndex].oneTimeAmountFormatted = $scope.donationsums[donationSumIndex].oneTimeAmount.toLocaleString 'en',
            style: 'currency'
            currency: 'USD'
            minimumFractionDigits: 2
        else
          $scope.donationsums[donationSumIndex].recurringCount = $scope.donationsums[donationSumIndex].recurringCount + 1
          $scope.donationsums[donationSumIndex].recurringAmount = Number($scope.donationsums[donationSumIndex].recurringAmount) + paymentAmount
          $scope.donationsums[donationSumIndex].recurringAmountFormatted = $scope.donationsums[donationSumIndex].recurringAmount.toLocaleString 'en',
            style: 'currency'
            currency: 'USD'
            minimumFractionDigits: 2
        if not $scope.$$phase
          $scope.$apply()
      
      $scope.refreshReport = ->
        $scope.donations = []
        $scope.donationsums = []
        updateDateRange $scope.reportconfig.startdate, $scope.reportconfig.enddate, $scope.reportconfig.datelabel
        DataTableService.destroy '.report-table'
        $('.content .js--loading-overlay').removeClass 'hidden'
        getDonationSums()
      
      $scope.blurReportConfigTypeAhead = (e) ->
        $timeout ->
          if $(e.target).is('.ng-invalid-editable')
            $(e.target).val('').change()
            $scope[$(e.target).data('ng-model')] = ''
        , 250
      
      $scope.updateReportConfig = (e) ->
        $('#report-config-modal').modal 'hide'
        StorageService.storeData 'reportconfig_donations_summary', $scope.reportconfig, true
        $scope.refreshReport()
      
      $scope.download = ->
        csvData = 'Time Period,One-Time Count,One-Time Amount,Sustaining Count,Sustaining Amount,Total Count,Total Amount'
        $.each $scope.donationsums, ->
          csvData += '\n' + 
                     '"' + this.periodFormatted + '",' + 
                     this.oneTimeCount + ',' + 
                     this.oneTimeAmount + ',' + 
                     this.recurringCount + ',' + 
                     this.recurringAmount + ',' + 
                     this.count + ',' + 
                     this.amount
        $('.js--report-save-as').off('change').on 'change', ->
          require('fs').writeFile $(this).val(), csvData, (error) ->
            if error
              angular.noop()
        .click()
  ]