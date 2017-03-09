var dataViewerApp = angular.module('dataViewerApp', [
  'ngRoute', 
  'ui.bootstrap', 
  'dataViewerControllers'
]), 
dataViewerControllers = angular.module('dataViewerControllers', []);

dataViewerApp.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

dataViewerApp.config(['$compileProvider', function($compileProvider) {
  $compileProvider.preAssignBindingsEnabled(true);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
}]);

dataViewerApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'views/login.html', 
    controller: 'LoginViewController'
  }).when('/report-constituents-summary', {
    templateUrl: 'views/report-constituents-summary.html', 
    controller: 'ConstituentSummaryReportViewController'
  }).when('/report-constituents-detail', {
    templateUrl: 'views/report-constituents-detail.html', 
    controller: 'ConstituentDetailReportViewController'
  }).when('/report-donations-summary', {
    templateUrl: 'views/report-donations-summary.html', 
    controller: 'DonationSummaryReportViewController'
  }).when('/report-donations-detail', {
    templateUrl: 'views/report-donations-detail.html', 
    controller: 'DonationDetailReportViewController'
  }).when('/report-ecommerce-summary', {
    templateUrl: 'views/report-ecommerce-summary.html', 
    controller: 'EcommerceSummaryReportViewController'
  }).when('/report-ecommerce-detail', {
    templateUrl: 'views/report-ecommerce-detail.html', 
    controller: 'EcommerceDetailReportViewController'
  }).otherwise({
    redirectTo: '/login'
  });
}]);