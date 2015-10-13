dataViewerApp.factory('ConstituentService', ['DatabaseService', function(DatabaseService) {
  return {
    getConstituents: function(options) {
      var settings = $.extend({
        success: $.noop
      }, options || {});
      
      DatabaseService.select({
        objectStore: 'Constituent', 
        error: function() {
          /* TODO */
        }, 
        success: function() {
          /* TODO */
        }
      });
    }, 
    
    getConstituentSummary: function() {
      this.getConstituents({
        success: function() {
          /* TODO */
        }
      });
    }
  };
}]);