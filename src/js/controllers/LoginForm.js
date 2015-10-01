dataViewerControllers.controller('LoginFormController', ['$scope', '$location', 'WebServicesService', 'SessionService', function($scope, $location, WebServicesService, SessionService) {
  var requestUrl = WebServicesService.getRequestUrl();
  
  $scope.cwslogin = {};
  
  if(requestUrl) {
    $scope.cwslogin.url = requestUrl;
  }
  
  $scope.submit = function(e) {
    $scope.alerts = [];
    
    $scope.addAlert = function(alert) {
      $scope.alerts.push(alert);
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    };
    
    var goToConstituentSummaryReportView = function() {
      $location.path('/report-constituents-summary');
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    };
    
    /* TODO: disable submit button while loading */
    
    WebServicesService.login({
      url: $('#login-url').val(), 
      username: $('#login-username').val(), 
      password: $('#login-password').val(), 
      error: function(errorThrown) {
        var errorMessage = errorThrown;
        
        /* TODO: default errorMessage */
        
        if(errorMessage.indexOf('expecting: /{public API version}/') !== -1 || 
           errorMessage.indexOf('Failed to resolve site: ') !== -1) {
          /* TODO */
        }
        
        $scope.addAlert({
          type: 'danger', 
          message: errorMessage
        });
      }, 
      success: function(response) {
        var $faultstring = $(response).find('faultstring');
        
        if($faultstring.length > 0) {
          $scope.addAlert({
            type: 'danger', 
            message: $faultstring.text()
          });
        }
        else {
          goToConstituentSummaryReportView();
        }
      }
    });
  };
}]);