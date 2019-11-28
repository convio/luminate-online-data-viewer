angular.module 'dataViewerApp'
  .factory 'WebServicesService', [
    'StorageService'
    (StorageService) ->
      service =
        getRequestUrl: ->
          cwslogin = StorageService.getStoredData('cwslogin')
          requestUrl = null
          if cwslogin and cwslogin.url
            requestUrl = cwslogin.url
          requestUrl
        request: (options) ->
          settings = $.extend
            includeSessionId: true
            error: $.noop
            success: $.noop
          , options or {}
          requestUrl = this.getRequestUrl()
          if not requestUrl
            angular.noop()
          else
            sessionId = null
            if settings.includeSessionId
              sessionId = StorageService.getStoredData('SessionId')
            $.ajax
              url: requestUrl
              type: 'POST'
              data: '<?xml version=\'1.0\' encoding=\'UTF-8\' ?>' + 
                    '<soap:Envelope xmlns:soap=\'http://schemas.xmlsoap.org/soap/envelope/\'>' + 
                      (if settings.includeSessionId and sessionId then ('<soap:Header>' + 
                         '<Session xmlns=\'urn:soap.convio.com\'>' + 
                           '<SessionId>' + 
                             sessionId + 
                           '</SessionId>' + 
                         '</Session>'  + 
                       '</soap:Header>') else '') + 
                      (if settings.body then ('<soap:Body>' + 
                         settings.body + 
                       '</soap:Body>') else '') + 
                    '</soap:Envelope>'
              error: (jqXHR, textStatus, errorThrown) ->
                settings.error errorThrown
              success: (response) ->
                $faultcode = $(response).find 'faultcode'
                if $faultcode.length > 0 and $faultcode.text() is 'fns:SESSION'
                  $('.js--view-change-shim').attr('href', '#/login').click()
                else
                  settings.success response
        login: (options) ->
          settings = $.extend
            error: $.noop
            success: $.noop
          , options or {}
          StorageService.deleteStoredData 'cwslogin'
          if settings.url
            StorageService.storeData 'cwslogin',
              url: settings.url
          StorageService.deleteStoredData 'SessionId'
          if not settings.url or settings.url is '' or not settings.username or settings.username is '' or not settings.password or settings.password is ''
            angular.noop()
          else
            this.request
              includeSessionId: false
              body: '<Login xmlns=\'urn:soap.convio.com\'>' + 
                      '<UserName>' + 
                        settings.username + 
                      '</UserName>' + 
                      '<Password>' + 
                        settings.password + 
                      '</Password>' + 
                    '</Login>'
              error: settings.error
              success: (response) ->
                $faultstring = $(response).find 'faultstring'
                if $faultstring.length is 0
                  StorageService.storeData 'cwslogin',
                    url: settings.url
                    username: settings.username
                  StorageService.storeData 'SessionId', $(response).find('SessionId').text(), true
                settings.success response
        query: (options) ->
          settings = $.extend
            page: '1'
            pageSize: '200'
            error: $.noop
            success: $.noop
          , options or {}
          if not settings.statement
            angular.noop()
          else
            this.request
              body: '<Query xmlns=\'urn:soap.convio.com\'>' + 
                      '<QueryString>' + 
                        settings.statement + 
                      '</QueryString>' + 
                      '<Page>' + 
                        settings.page + 
                      '</Page>' + 
                      '<PageSize>' + 
                        settings.pageSize + 
                      '</PageSize>' + 
                    '</Query>'
              error: settings.error
              success: settings.success
      service
  ]