dataViewerApp.value('Cache', {});

dataViewerApp.factory('CacheService', ['Cache', function(Cache) {
  return {
    cacheReportConfig: function(view, reportConfig) {
      var configData = {};
      configData[view] = reportConfig || {};
      
      dataViewerApp.value('Cache', $.extend(Cache, configData));
    }, 
    
    getCachedReportConfig: function(view) {
      return Cache[view] || {};
    }
  };
}]);