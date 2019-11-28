angular.module 'dataViewerApp'
  .config [
    '$routeProvider'
    ($routeProvider) ->
      $routeProvider.when '/login',
        templateUrl: 'view/login.html'
        controller: 'LoginViewController'
      .when '/report-constituents-summary',
        templateUrl: 'view/report-constituents-summary.html'
        controller: 'ConstituentSummaryReportViewController'
      .when '/report-constituents-detail',
        templateUrl: 'view/report-constituents-detail.html'
        controller: 'ConstituentDetailReportViewController'
      .when '/report-donations-summary',
        templateUrl: 'view/report-donations-summary.html'
        controller: 'DonationSummaryReportViewController'
      .when '/report-donations-detail',
        templateUrl: 'view/report-donations-detail.html'
        controller: 'DonationDetailReportViewController'
      .when '/report-ecommerce-summary',
        templateUrl: 'view/report-ecommerce-summary.html'
        controller: 'EcommerceSummaryReportViewController'
      .when '/report-ecommerce-detail',
        templateUrl: 'view/report-ecommerce-detail.html'
        controller: 'EcommerceDetailReportViewController'
      .otherwise
        redirectTo: '/login'
  ]