dataViewerApp.factory('DataTableService', [function() {
  return {
    init: function(selector, options) {
      this.destroy(selector);
      
      var settings = $.extend({
        'searching': false, 
        'info': true, 
        'paging': true, 
        'lengthChange': false, 
        'ordering': true, 
        'order': [
          [0, 'desc']
        ], 
        'autoWidth': false, 
        'dom': '<".table-responsive"t>ip'
      }, options || {});
      
      $(selector).DataTable(settings);
    }, 
    
    destroy: function(selector) {
      $(selector).DataTable().destroy();
    }
  };
}]);