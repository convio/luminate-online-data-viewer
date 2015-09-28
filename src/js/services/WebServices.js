dataViewerApp.value('WebServices', {});

dataViewerApp.factory('WebServicesService', ['WebServices', 'SessionService', function(WebServices, SessionService) {
  return {
    setRequestUrl: function(requestUrl) {
      dataViewerApp.value('WebServices', $.extend(WebServices, {
        url: requestUrl
      }));
    }, 
    
    getRequestUrl: function() {
      return WebServices.url;
    }, 
    
    request: function(options) {
      var settings = $.extend({
        includeSessionId: true, 
        error: $.noop, 
        success: $.noop
      }, options || {}), 
      requestUrl = this.getRequestUrl();
      
      if(!requestUrl) {
        /* TODO */
      }
      else {
        var sessionId;
        
        if(settings.includeSessionId) {
          sessionId = SessionService.getSessionId();
        }
        
        $.ajax({
          url: requestUrl, 
          type: 'POST', 
          data: '<?xml version=\'1.0\' encoding=\'UTF-8\' ?>' + 
                '<soap:Envelope xmlns:soap=\'http://schemas.xmlsoap.org/soap/envelope/\'>' + 
                  (settings.includeSessionId && sessionId ? ('<soap:Header>' + 
                     '<Session xmlns=\'urn:soap.convio.com\'>' + 
                       '<SessionId>' + 
                         sessionId + 
                       '</SessionId>' + 
                     '</Session>'  + 
                   '</soap:Header>') : '') + 
                  (settings.body ? ('<soap:Body>' + 
                     settings.body + 
                   '</soap:Body>') : '') + 
                '</soap:Envelope>', 
          error: function(jqXHR, textStatus, errorThrown) {
            settings.error(errorThrown);
          }, 
          success: function(response) {
            var $faultcode = $(response).find('faultcode');
            
            if($faultcode.length > 0 && $faultcode.text() === 'fns:SESSION') {
              /* TODO: redirect to login */
            }
            else {
              settings.success(response);
            }
          }
        });
      }
    }, 
    
    login: function(options) {
      var settings = $.extend({
        error: $.noop, 
        success: $.noop
      }, options || {});
      
      this.setRequestUrl(settings.url);
      
      if(!settings.url) {
        /* TODO */
      }
      else if(!settings.username || !settings.password) {
        /* TODO */
      }
      else {
        SessionService.reset();
        
        this.request({
          includeSessionId: false, 
          body: '<Login xmlns=\'urn:soap.convio.com\'>' + 
                  '<UserName>' + 
                    settings.username + 
                  '</UserName>' + 
                  '<Password>' + 
                    settings.password + 
                  '</Password>' + 
                '</Login>', 
          error: settings.error, 
          success: function(response) {
            var $faultstring = $(response).find('faultstring');
            
            if($faultstring.length === 0) {
              SessionService.setSessionId($(response).find('SessionId').text());
            }
            
            settings.success(response);
          }
        });
      }
    }, 
    
    query: function(options) {
      var settings = $.extend({
        page: '1', 
        pageSize: '200', 
        error: $.noop, 
        success: $.noop
      }, options || {});
      
      if(!settings.statement) {
        /* TODO */
      }
      else {
        this.request({
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
                '</Query>', 
          error: settings.error, 
          success: settings.success
        });
      }
    }
  };
}]);