dataViewerControllers.controller 'ConstituentDetailReportViewController', [
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
    , StorageService.getStoredData('reportconfig_constituents_detail') or {}
    
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
    
    getConstituents = ->
      ConstituentService.getConstituents
        startDate: $scope.reportconfig.startdate.format 'YYYY-MM-DD[T]HH:mm:ssZ'
        endDate: $scope.reportconfig.enddate.format 'YYYY-MM-DD[T]HH:mm:ssZ'
        success: (constituents) ->
          if $scope.$location.path() is '/report-constituents-detail'
            DataTableService.destroy '.report-table'
            if constituents.length > 0
              $.each constituents, ->
                addConstituent this
            DataTableService.init '.report-table',
              'order': [
                [6, 'desc']
              ]
        complete: ->
          if $scope.$location.path() is '/report-constituents-detail'
            refreshUpdateTime()
            $('.content .js--loading-overlay').addClass 'hidden'
    getConstituents()
    
    addConstituent = (constituent) ->
      $scope.constituents.push constituent
      if not $scope.$$phase
        $scope.$apply()
    
    $scope.refreshReport = ->
      $scope.constituents = []
      updateDateRange $scope.reportconfig.startdate, $scope.reportconfig.enddate, $scope.reportconfig.datelabel
      DataTableService.destroy '.report-table'
      $('.content .js--loading-overlay').removeClass 'hidden'
      getConstituents()
    
    $scope.updateReportConfig = (e) ->
      $('#report-config-modal').modal 'hide'
      StorageService.storeData 'reportconfig_constituents_detail', $scope.reportconfig, true
      $scope.refreshReport()
    
    $scope.download = ->
      csvData = 'Constituent ID,First Name,Last Name,Email Address,City,State,Creation Date'
      $.each $scope.constituents, ->
        csvData += '\n' + 
                   this.ConsId + ',' + 
                   '"' + this.ConsName.FirstName.replace(/"/g, '""') + '",' + 
                   '"' + this.ConsName.LastName.replace(/"/g, '""') + '",' + 
                   this.PrimaryEmail + ',' + 
                   this.HomeAddress.City + ',' + 
                   this.HomeAddress.State + ',' + 
                   this._CreationDateFormatted
      $('.js--report-save-as').off('change').on 'change', ->
        require('fs').writeFile $(this).val(), csvData, (error) ->
          if error
            angular.noop()
      .click()
]