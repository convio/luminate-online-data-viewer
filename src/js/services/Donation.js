dataViewerApp.factory('DonationService', ['DatabaseService', function(DatabaseService) {
  return {
    getDonations: function(options) {
      var settings = $.extend({
        success: $.noop
      }, options || {});
      
      DatabaseService.select({
        objectStore: 'Donation', 
        error: function() {
          /* TODO */
        }, 
        success: function() {
          /* TODO */
        }
      });
    }, 
    
    getDonationSummary: function() {
      this.getDonations({
        success: function() {
          /* TODO */
        }
      });
    }
  };
}]);