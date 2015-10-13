dataViewerApp.factory('ProductOrderService', ['DatabaseService', function(DatabaseService) {
  return {
    getOrders: function(options) {
      var settings = $.extend({
        success: $.noop
      }, options || {});
      
      DatabaseService.select({
        objectStore: 'ProductOrder', 
        error: function() {
          /* TODO */
        }, 
        success: function() {
          /* TODO */
        }
      });
    }, 
    
    getOrderSummary: function() {
      this.getOrders({
        success: function() {
          /* TODO */
        }
      });
    }
  };
}]);