dataViewerApp.factory('StorageService', [function() {
  return {
    storeData: function(propertyName, propertyValue, useSessionStorage) {
      if($.type(propertyValue) === 'object') {
        propertyValue = JSON.stringify(propertyValue);
      }
      
      if(useSessionStorage === true) {
        sessionStorage['dv__' + propertyName] = propertyValue;
      }
      else {
        localStorage['dv__' + propertyName] = propertyValue;
      }
    }, 
    
    getStoredData: function(propertyName) {
      var propertyValue;
      
      if(sessionStorage['dv__' + propertyName]) {
        propertyValue = sessionStorage['dv__' + propertyName];
      }
      else if(localStorage['dv__' + propertyName]) {
        propertyValue = localStorage['dv__' + propertyName];
      }
      
      try {
        propertyValue = JSON.parse(propertyValue);
      }
      catch(e) {}
      
      return propertyValue;
    }
  };
}]);