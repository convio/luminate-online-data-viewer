angular.module 'dataViewerControllers'
  .controller 'LoginFormController', [
    '$scope'
    'WebServicesService'
    'StorageService'
    ($scope, WebServicesService, StorageService) ->
      $scope.cwslogin = $.extend
        url: ''
        username: ''
        password: ''
      , StorageService.getStoredData('cwslogin') or {}
      
      $scope.submit = (e) ->
        if $('.js--login-form-submit[disabled]').length is 0
          $scope.alerts = []
          $scope.addAlert = (alert) ->
            $scope.alerts.push alert
            if not $scope.$$phase
              $scope.$apply()
          $scope.loginform.url.$setValidity 'validUrl', true
          
          loginUrl = $.trim $scope.cwslogin.url
          loginUsername = $.trim $scope.cwslogin.username
          loginPassword = $.trim $scope.cwslogin.password
          
          if loginUrl is '' or loginUsername is '' or loginPassword is ''
            angular.noop()
          else if loginUrl.toLowerCase().indexOf('http') isnt 0
            $scope.loginform.url.$setValidity 'validUrl', false
          else
            $('.js--login-form-submit').attr 'disabled', true
            WebServicesService.login
              url: loginUrl
              username: loginUsername
              password: loginPassword
              error: (errorThrown) ->
                errorMessage = errorThrown
                if not errorMessage or errorMessage is ''
                  errorMessage = 'Error processing request. Please try again.'
                $scope.addAlert
                  message: errorMessage
                if errorMessage.indexOf('expecting: /{public API version}/') isnt -1 or errorMessage.indexOf('Failed to resolve site: ') isnt -1
                  $scope.loginform.url.$setValidity 'validUrl', false
                  if not $scope.$$phase
                    $scope.$apply()
                $('.js--login-form-submit').removeAttr 'disabled'
              success: (response) ->
                $faultstring = $(response).find 'faultstring'
                if $faultstring.length > 0
                  $scope.addAlert
                    message: $faultstring.text()
                  $('.js--login-form-submit').removeAttr 'disabled'
                else
                  sessionId = StorageService.getStoredData 'SessionId'
                  if not sessionId
                    $('.js--login-form-submit').removeAttr 'disabled'
                  else
                    $('.js--login-form-submit').removeAttr 'disabled'
                    $('.js--view-change-shim').attr('href', '#/report-constituents-summary').click()
  ]