dataViewerApp.factory('DatabaseService', [function() {
  return {
    version: 1, 
    
    open: function(options) {
      var settings = $.extend({
        error: $.noop, 
        success: $.noop
      }, options || {});
      
      var reportResultsDB, 
      reportResultsDBRequest = indexedDB.open('QueryResults', this.version);
      reportResultsDBRequest.onerror = function() {
        /* TODO */
      };
      reportResultsDBRequest.onupgradeneeded = function(e) {
        reportResultsDB = e.target.result;
        
        var constituentObjectStore = reportResultsDB.createObjectStore('Constituent', {
          keyPath: 'ConsId'
        });
        constituentObjectStore.createIndex('CreationDate', 'CreationDate', {
          unique: false
        });
      };
      reportResultsDBRequest.onsuccess = function(e) {
        reportResultsDB = e.target.result;
        
        reportResultsDB.onversionchange = function() {
          /* TODO */
        };
        
        settings.success(reportResultsDB);
      };
    }, 
    
    insert: function(options) {
      var settings = $.extend({
        error: $.noop, 
        success: $.noop
      }, options || {});
      
      if(!settings.objectStore || !settings.reportData) {
        /* TODO */
      }
      else {
        this.open({
          success: function(reportResultsDB) {
            var insertTransaction = reportResultsDB.transaction([settings.objectStore], 'readwrite');
            insertTransaction.onerror = function() {
              /* TODO */
            };
            insertTransaction.oncomplete = function() {
              settings.success();
            };
            var insertObjectStore = insertTransaction.objectStore(settings.objectStore);
            for(var i in settings.reportData) {
              var insertRequest = insertObjectStore.add(settings.reportData[i]);
            }
          }
        });
      }
    }, 
    
    select: function(options) {
      var settings = $.extend({
        page: '1', 
        pageSize: '200', 
        error: $.noop, 
        success: $.noop
      }, options || {});
      
      if(!settings.objectStore) {
        /* TODO */
      }
      else {
        this.open({
          success: function(reportResultsDB) {
            var selectObjectStore = reportResultsDB.transaction(settings.objectStore).objectStore(settings.objectStore), 
            selectCursorRequest = selectObjectStore.openCursor(), 
            selectResults = [];
            selectCursorRequest.onerror = function() {
              /* TODO */
            };
            selectCursorRequest.onsuccess = function(e) {
              var cursor = e.target.result;
              if(cursor) {
                selectResults.push(cursor.value);
                cursor.continue();
              }
              else {
                settings.success(selectResults);
              }
            };
          }
        });
      }
    }
  };
}]);