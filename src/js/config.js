var dataViewerApp = angular.module('dataViewerApp', [
  'ngRoute', 
  'ui.bootstrap', 
  'dataViewerControllers'
]), 
dataViewerControllers = angular.module('dataViewerControllers', []);

dataViewerApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'views/login.html', 
    controller: 'LoginViewController'
  }).when('/report-constituents', {
    templateUrl: 'views/report-constituents.html', 
    controller: 'ConstituentsReportViewController'
  }).when('/report-donations', {
    templateUrl: 'views/report-donations.html', 
    controller: 'DonationsReportViewController'
  }).when('/report-ecommerce', {
    templateUrl: 'views/report-ecommerce.html', 
    controller: 'EcommerceReportViewController'
  }).otherwise({
    redirectTo: '/login'
  });
}]);