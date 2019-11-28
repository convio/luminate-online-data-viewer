dataViewerControllers.controller 'EcommerceSummaryReportViewController', [
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
      summaryinterval: 'hourly'
    , StorageService.getStoredData('reportconfig_ecommerce_summary') or {}
    
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
    $scope.ordersums = []
    
    getOrderSums = (options) ->
      ProductOrderService.getProductOrders
        startDate: $scope.reportconfig.startdate.format 'YYYY-MM-DD[T]HH:mm:ssZ'
        endDate: $scope.reportconfig.enddate.format 'YYYY-MM-DD[T]HH:mm:ssZ'
        success: (productOrders) ->
          if $scope.$location.path() is '/report-ecommerce-summary'
            DataTableService.destroy '.report-table'
            if productOrders.length > 0
              $.each productOrders, ->
                addOrder this
            DataTableService.init '.report-table'
        complete: ->
          if $scope.$location.path() is '/report-ecommerce-summary'
            refreshUpdateTime()
            $('.content .js--loading-overlay').addClass 'hidden'
    getOrderSums()
    
    addOrder = (order) ->
      $scope.orders.push order
      paymentDate = order.Payment.PaymentDate
      paymentHour = moment(paymentDate).format 'YYYY-MM-DD[T]HH'
      paymentPeriod = paymentHour
      paymentAmount = Number order.Payment.Amount
      orderSumIndex = -1
      switch $scope.reportconfig.summaryinterval
        when 'daily'
          paymentPeriod = moment(paymentDate).format 'YYYY-MM-DD'
        when 'weekly'
          paymentPeriod = moment(paymentDate).startOf('week').format 'YYYY-MM-DD'
        when 'monthly'
          paymentPeriod = moment(paymentDate).format 'YYYY-MM'
      $.each $scope.ordersums, (sumIndex) ->
        if this.period is paymentPeriod
          orderSumIndex = sumIndex
      if orderSumIndex is -1
        paymentPeriodFormatted = moment(paymentDate).format 'MMM D, YYYY - h:00a'
        switch $scope.reportconfig.summaryinterval
          when 'daily'
            paymentPeriodFormatted = moment(paymentDate).format 'MMM D, YYYY'
          when 'weekly'
            paymentPeriodFormatted = moment(paymentDate).startOf('week').format '[Week of] MMM D, YYYY'
          when  'monthly'
            paymentPeriodFormatted = moment(paymentDate).format 'MMM YYYY'
        $scope.ordersums.push
          period: paymentPeriod
          periodFormatted: paymentPeriodFormatted
          count: 0
          amount: 0
          amountFormatted: '$0.00'
        orderSumIndex = $scope.ordersums.length - 1
      $scope.ordersums[orderSumIndex].count = $scope.ordersums[orderSumIndex].count + 1
      $scope.ordersums[orderSumIndex].amount = Number($scope.ordersums[orderSumIndex].amount) + paymentAmount
      $scope.ordersums[orderSumIndex].amountFormatted = $scope.ordersums[orderSumIndex].amount.toLocaleString 'en',
        style: 'currency'
        currency: 'USD'
        minimumFractionDigits: 2
      if not $scope.$$phase
        $scope.$apply()
    
    $scope.refreshReport = ->
      $scope.orders = []
      $scope.ordersums = []
      updateDateRange $scope.reportconfig.startdate, $scope.reportconfig.enddate, $scope.reportconfig.datelabel
      DataTableService.destroy '.report-table'
      $('.content .js--loading-overlay').removeClass 'hidden'
      getOrderSums()
    
    $scope.updateReportConfig = (e) ->
      $('#report-config-modal').modal 'hide'
      StorageService.storeData 'reportconfig_ecommerce_summary', $scope.reportconfig, true
      $scope.refreshReport()
    
    $scope.download = ->
      csvData = 'Time Period,Total Count,Total Amount'
      $.each $scope.ordersums, ->
        csvData += '\n' + 
                   '"' + this.periodFormatted + '",' + 
                   this.count + ',' + 
                   this.amount
      $('.js--report-save-as').off('change').on 'change', ->
        require('fs').writeFile $(this).val(), csvData, (error) ->
          if error
            angular.noop()
      .click()
]