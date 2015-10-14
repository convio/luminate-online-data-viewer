dataViewerApp.factory('DateRangePickerService', [function() {
  return {
    init: function(selector, callback) {
      $(selector).daterangepicker({
        startDate: moment().subtract(1, 'days'), 
        endDate: moment(), 
        ranges: {
          'Last 24 Hours': [
            moment().subtract(1, 'days'), 
            moment()
          ], 
          'Today': [
            moment().startOf('day'), 
            moment()
          ], 
          'Yesterday': [
            moment().subtract(1, 'days').startOf('day'), 
            moment().subtract(1, 'days').endOf('day')
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
        }, 
        timePicker: true
      }, callback);
    }
  };
}]);