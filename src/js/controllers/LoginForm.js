dataViewerControllers.controller('LoginFormController', ['$scope', 'WebServicesService', 'StorageService', function($scope, WebServicesService, StorageService) {
  $scope.cwslogin = $.extend({
    url: '', 
    username: '', 
    password: ''
  }, StorageService.getStoredData('cwslogin') || {});
  
  $scope.submit = function(e) {
    if($('.js--login-form-submit[disabled]').length === 0) {
      $scope.alerts = [];
      
      $scope.addAlert = function(alert) {
        $scope.alerts.push(alert);
        if(!$scope.$$phase) {
          $scope.$apply();
        }
      };
      
      $scope.loginform.url.$setValidity('validUrl', true);
      
      var loginUrl = $.trim($scope.cwslogin.url), 
      loginUsername = $.trim($scope.cwslogin.username), 
      loginPassword = $.trim($scope.cwslogin.password);
      
      if(loginUrl === '' || 
         loginUsername === '' || 
         loginPassword === '') {
        /* TODO */
      }
      else if(loginUrl.toLowerCase().indexOf('http') !== 0) {
        $scope.loginform.url.$setValidity('validUrl', false);
      }
      else {
        $('.js--login-form-submit').attr('disabled', true);
        
        WebServicesService.login({
          url: loginUrl, 
          username: loginUsername, 
          password: loginPassword, 
          error: function(errorThrown) {
            var errorMessage = errorThrown;
            
            if(!errorMessage || errorMessage === '') {
              errorMessage = 'Error processing request. Please try again.';
            }
            
            $scope.addAlert({
              message: errorMessage
            });
            
            if(errorMessage.indexOf('expecting: /{public API version}/') !== -1 || 
               errorMessage.indexOf('Failed to resolve site: ') !== -1) {
              $scope.loginform.url.$setValidity('validUrl', false);
              if(!$scope.$$phase) {
                $scope.$apply();
              }
            }
            
            $('.js--login-form-submit').removeAttr('disabled');
          }, 
          success: function(response) {
            var $faultstring = $(response).find('faultstring');
            
            if($faultstring.length > 0) {
              $scope.addAlert({
                message: $faultstring.text()
              });
              
              $('.js--login-form-submit').removeAttr('disabled');
            }
            else {
              var sessionId = StorageService.getStoredData('SessionId');
              
              if(!sessionId) {
                /* TODO */
                
                $('.js--login-form-submit').removeAttr('disabled');
              }
              else {
                $('.js--login-form-submit').removeAttr('disabled');
                
                $('.js--view-change-shim').attr('href', '#/report-constituents-summary').click();
              }
            }
          }
        });
      }
    }
  };
}]);