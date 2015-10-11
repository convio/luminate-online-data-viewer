dataViewerApp.factory('StorageService', [function() {
  return {
    storeData: function(propertyName, propertyValue, useSessionStorage) {
      if(useSessionStorage === true) {
        if(!sessionStorage.dataViewer) {
          sessionStorage.dataViewer = {};
        }
        
        sessionStorage.dataViewer[propertyName] = propertyValue;
      }
      else {
        if(!localStorage.dataViewer) {
          localStorage.dataViewer = {};
        }
        
        localStorage.dataViewer[propertyName] = propertyValue;
      }
    }, 
    
    getStoredData: function(propertyName) {
      var propertyValue;
      
      if(sessionStorage.dataViewer && sessionStorage.dataViewer[propertyName]) {
        propertyValue = sessionStorage.dataViewer[propertyName];
      }
      else if(localStorage.dataViewer && localStorage.dataViewer[propertyName]) {
        propertyValue = localStorage.dataViewer[propertyName];
      }
      
      return propertyValue;
    }
  };
}]);