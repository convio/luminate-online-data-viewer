dataViewerControllers.controller 'EcommerceDetailReportViewController', [
  '$scope'
  'StorageService'
  'ProductOrderService'
  'DateRangePickerService'
  'DataTableService'
  ($scope, StorageService, ProductOrderService, DateRangePickerService, DataTableService) ->
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
    , StorageService.getStoredData('reportconfig_ecommerce_detail') or {}
    
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
    
    $scope.orders = []
    
    getOrders = ->
      ProductOrderService.getProductOrders
        startDate: $scope.reportconfig.startdate.format 'YYYY-MM-DD[T]HH:mm:ssZ'
        endDate: $scope.reportconfig.enddate.format 'YYYY-MM-DD[T]HH:mm:ssZ'
        success: (productOrders) ->
          if $scope.$location.path() is '/report-ecommerce-detail'
            DataTableService.destroy '.report-table'
            if productOrders.length > 0
              $.each productOrders, ->
                addOrder this
            DataTableService.init '.report-table',
              'order': [
                [8, 'desc']
              ]
        complete: ->
          if $scope.$location.path() is '/report-ecommerce-detail'
            refreshUpdateTime()
            $('.content .js--loading-overlay').addClass 'hidden'
    getOrders()
    
    addOrder = (order) ->
      $scope.orders.push order
      if not $scope.$$phase
        $scope.$apply()
    
    $scope.refreshReport = ->
      $scope.orders = []
      updateDateRange $scope.reportconfig.startdate, $scope.reportconfig.enddate, $scope.reportconfig.datelabel
      DataTableService.destroy '.report-table'
      $('.content .js--loading-overlay').removeClass 'hidden'
      getOrders()
    
    $scope.updateReportConfig = (e) ->
      $('#report-config-modal').modal 'hide'
      StorageService.storeData 'reportconfig_ecommerce_detail', $scope.reportconfig, true
      $scope.refreshReport()
    
    $scope.download = ->
      csvData = 'Transaction ID,Store ID,Order Amount,First Name,Last Name,Email Address,City,State,Order Date'
      $.each $scope.orders, ->
        csvData += '\n' + 
                   this.TransactionId + ',' + 
                   this.StoreId + ',' + 
                   this.Payment.Amount + ',' + 
                   '"' + this.Purchaser.ConsName.FirstName.replace(/"/g, '""') + '",' + 
                   '"' + this.Purchaser.ConsName.LastName.replace(/"/g, '""') + '",' + 
                   this.Purchaser.PrimaryEmail + ',' + 
                   this.Purchaser.HomeAddress.City + ',' + 
                   this.Purchaser.HomeAddress.State + ',' + 
                   this.Payment._PaymentDateFormatted
      $('.js--report-save-as').off('change').on 'change', ->
        require('fs').writeFile $(this).val(), csvData, (error) ->
          if error
            angular.noop()
      .click()
]