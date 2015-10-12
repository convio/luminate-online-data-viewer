dataViewerApp.factory('WebServicesService', ['StorageService', function(StorageService) {
  return {
    getRequestUrl: function() {
      var cwslogin = StorageService.getStoredData('cwslogin'), 
      requestUrl;
      
      if(cwslogin && cwslogin.url) {
        requestUrl = cwslogin.url;
      }
      
      return requestUrl;
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
          sessionId = StorageService.getStoredData('SessionId');
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
              $('.js--view-change-shim').attr('href', '#/login').click();
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
      
      StorageService.deleteStoredData('cwslogin');
      if(settings.url) {
        StorageService.storeData('cwslogin', {
          url: settings.url
        });
      }
      
      StorageService.deleteStoredData('SessionId');
      
      if(!settings.url || settings.url === '' || 
         !settings.username || settings.username === '' || 
         !settings.password || settings.password === '') {
        /* TODO */
      }
      else {
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
              StorageService.storeData('cwslogin', {
                url: settings.url, 
                username: settings.username
              });
              
              StorageService.storeData('SessionId', $(response).find('SessionId').text(), true);
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