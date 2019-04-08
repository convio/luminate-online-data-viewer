dataViewerApp.factory('DateRangePickerService', [function() {
  return {
    init: function(selector, callback) {
      var _this = this;
      
      $(selector).daterangepicker({
        startDate: moment().subtract(1, 'days'), 
        endDate: moment(), 
        ranges: _this.getRanges(), 
        timePicker: true
      }, callback);
    }, 
    
    getRanges: function() {
      return {
        'This Hour': [
          moment().startOf('hour'), 
          moment()
        ], 
        'Today': [
          moment().startOf('day'), 
          moment()
        ], 
        'Yesterday': [
          moment().subtract(1, 'day').startOf('day'), 
          moment().subtract(1, 'day').endOf('day')
        ], 
        'Last 7 Days': [
          moment().subtract(6, 'days').startOf('day'), 
          moment()
        ], 
        'Last 30 Days': [
          moment().subtract(29, 'days').startOf('day'), 
          moment()
        ], 
        'This Month': [
          moment().startOf('month'), 
          moment()
        ], 
        'Last Month': [
          moment().subtract(1, 'month').startOf('month'), 
          moment().subtract(1, 'month').endOf('month')
        ]
      }
    }, 
    
    getDatesForRange: function(rangeLabel, callback) {
      var _this = this, 
      rangeDates = _this.getRanges()[rangeLabel];
      callback(rangeDates[0], rangeDates[1]);
    }
  };
}]);