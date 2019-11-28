angular.module 'dataViewerControllers'
  .controller 'ConstituentSummaryReportViewController', [
    '$scope'
    'StorageService'
    'ConstituentService'
    'DateRangePickerService'
    'DataTableService'
    ($scope, StorageService, ConstituentService, DateRangePickerService, DataTableService) ->
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
      , StorageService.getStoredData('reportconfig_constituents_summary') or {}
      
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
      
      $scope.constituents = []
      $scope.constituentsums = []
      
      getConstituentSums = ->
        ConstituentService.getConstituents
          startDate: $scope.reportconfig.startdate.format 'YYYY-MM-DD[T]HH:mm:ssZ'
          endDate: $scope.reportconfig.enddate.format 'YYYY-MM-DD[T]HH:mm:ssZ'
          success: (constituents) ->
            if $scope.$location.path() is '/report-constituents-summary'
              DataTableService.destroy '.report-table'
              if constituents.length > 0
                $.each constituents, ->
                  addConstituent this
              DataTableService.init '.report-table'
          complete: ->
            if $scope.$location.path() is '/report-constituents-summary'
              refreshUpdateTime()
              $('.content .js--loading-overlay').addClass 'hidden'
      getConstituentSums()
      
      addConstituent = (constituent) ->
        $scope.constituents.push constituent
        consCreationDate = constituent.CreationDate
        consCreationHour = moment(consCreationDate).format 'YYYY-MM-DD[T]HH'
        consCreationPeriod = consCreationHour
        constituentSumIndex = -1
        switch $scope.reportconfig.summaryinterval
          when 'daily'
            consCreationPeriod = moment(consCreationDate).format 'YYYY-MM-DD'
          when 'weekly'
            consCreationPeriod = moment(consCreationDate).startOf('week').format 'YYYY-MM-DD'
          when 'monthly'
            consCreationPeriod = moment(consCreationDate).format 'YYYY-MM'
        $.each $scope.constituentsums, (sumIndex) ->
          if this.period is consCreationPeriod
            constituentSumIndex = sumIndex
        if constituentSumIndex is -1
          consCreationPeriodFormatted = moment(consCreationDate).format 'MMM D, YYYY - h:00a'
          switch $scope.reportconfig.summaryinterval
            when 'daily'
              consCreationPeriodFormatted = moment(consCreationDate).format 'MMM D, YYYY'
            when 'weekly'
              consCreationPeriodFormatted = moment(consCreationDate).startOf('week').format '[Week of] MMM D, YYYY'
            when 'monthly'
              consCreationPeriodFormatted = moment(consCreationDate).format 'MMM YYYY'
          $scope.constituentsums.push
            period: consCreationPeriod
            periodFormatted: consCreationPeriodFormatted
            count: 0
          constituentSumIndex = $scope.constituentsums.length - 1
        $scope.constituentsums[constituentSumIndex].count = $scope.constituentsums[constituentSumIndex].count + 1
        if not $scope.$$phase
          $scope.$apply()
      
      $scope.refreshReport = ->
        updateDateRange $scope.reportconfig.startdate, $scope.reportconfig.enddate, $scope.reportconfig.datelabel
        $scope.constituents = []
        $scope.constituentsums = []
        DataTableService.destroy '.report-table'
        $('.content .js--loading-overlay').removeClass 'hidden'
        getConstituentSums()
      
      $scope.updateReportConfig = (e) ->
        $('#report-config-modal').modal 'hide'
        StorageService.storeData 'reportconfig_constituents_summary', $scope.reportconfig, true
        $scope.refreshReport()
      
      $scope.download = ->
        csvData = 'Time Period,Total Count'
        $.each $scope.constituentsums, ->
          csvData += '\n' + 
                     '"' + this.periodFormatted + '",' + 
                     this.count
        $('.js--report-save-as').off('change').on 'change', ->
          require('fs').writeFile $(this).val(), csvData, (error) ->
            if error
              angular.noop()
        .click()
  ]