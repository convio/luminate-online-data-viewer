dataViewerControllers.controller('ConstituentDetailReportViewController', ['$scope', 'DateRangePickerService', 'StorageService', 'WebServicesService', function($scope, DateRangePickerService, StorageService, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $('.daterangepicker').remove();
  
  DateRangePickerService.init('#report-config-datepicker', function (start, end, label) {
    $scope.reportconfig.datelabel = label;
    $scope.reportconfig.startdate = start.format('YYYY-MM-DD[T]HH:mm:ssZ');
    $scope.reportconfig.enddate = end.format('YYYY-MM-DD[T]HH:mm:ssZ');
    
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });
  
  $scope.reportconfig = $.extend({
    datelabel: 'Last 24 Hours', 
    startdate: '', 
    enddate: ''
  }, StorageService.getStoredData('reportconfig_constituents_detail') || {});
  
  $scope.constituents = [];
  
  var addConstituent = function(constituent) {
    $scope.constituents.push(constituent);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  getConstituents = function(options) {
    var settings = $.extend({
      page: '1'
    }, options || {}), 
    startDate = moment().subtract(1, 'days').format('YYYY-MM-DD[T]HH:mm:ssZ'), 
    endDate = moment().format('YYYY-MM-DD[T]HH:mm:ssZ');
    
    if($scope.reportconfig.startdate !== '') {
      startDate = $scope.reportconfig.startdate;
      
      if($scope.reportconfig.enddate !== '') {
        endDate = $scope.reportconfig.enddate;
      }
    }
    else if($scope.reportconfig.enddate !== '') {
      startDate = '1969-12-31T00:00:00';
      endDate = $scope.reportconfig.enddate;
    }
    
    WebServicesService.query({
      statement: 'select ConsId, ConsName.FirstName, ConsName.LastName, CreationDate, PrimaryEmail, HomeAddress.City, HomeAddress.State' + 
                 ' from Constituent' + 
                 ' where CreationDate &gt;= ' + startDate + ' and CreationDate &lt;= ' + endDate, 
      page: settings.page, 
      error: function() {
        /* TODO */
      }, 
      success: function(response) {
        var $faultstring = $(response).find('faultstring');
        
        if($faultstring.length > 0) {
          /* TODO */
        }
        else {
          $('.report-table').DataTable().destroy();
          
          var $records = $(response).find('Record');
          
          if($records.length !== 0) {
            $records.each(function() {
              var consId = $(this).find('ConsId').text(), 
              $consName = $(this).find('ConsName'), 
              consFirstName = $consName.find('FirstName').text(), 
              consLastName = $consName.find('LastName').text(), 
              consCreationDate = $(this).find('CreationDate').text(), 
              consCreationDateFormatted = moment(consCreationDate).format('MM/DD/YYYY h:mma'), 
              consPrimaryEmail = $(this).find('PrimaryEmail').text(), 
              $consHomeAddress = $(this).find('HomeAddress'), 
              consHomeCity = $consHomeAddress.find('City').text(), 
              consHomeState = $consHomeAddress.find('State').text();
              
              var constituentData = {
                'ConsId': consId, 
                'ConsName': {
                  'FirstName': consFirstName, 
                  'LastName': consLastName
                }, 
                'CreationDate': consCreationDate, 
                '_CreationDateFormatted': consCreationDateFormatted, 
                'PrimaryEmail': consPrimaryEmail, 
                'HomeAddress': {
                  'City': consHomeCity, 
                  'State': consHomeState
                }
              };
              
              addConstituent(constituentData);
            });
          }
          
          $('.report-table').DataTable({
            'searching': false, 
            'info': true, 
            'paging': true, 
            'lengthChange': false, 
            'ordering': true, 
            'order': [
              [6, 'desc']
            ], 
            'autoWidth': false, 
            'dom': '<".table-responsive"t>ip'
          });
          
          if($records.length === 200) {
            getConstituents({
              page: '' + (Number(settings.page) + 1)
            });
          }
          else {
            $('.content .js--loading-overlay').addClass('hidden');
          }
        }
      }
    });
  };
  
  getConstituents();
  
  $scope.refreshReport = function() {
    $scope.constituents = [];
    
    $('.report-table').DataTable().destroy();
    
    $('.content .js--loading-overlay').removeClass('hidden');
    
    $('.daterangepicker .applyBtn').click();

    getConstituents();
  };
  
  $scope.updateReportConfig = function(e) {
    $('#report-config-modal').modal('hide');
    
    StorageService.storeData('reportconfig_constituents_detail', $scope.reportconfig, true);
    
    $scope.refreshReport();
  };
  
  $scope.download = function() {
    var csvData = 'Constituent ID,First Name,Last Name,Email Address,City,State,Creation Date';
    $.each($scope.constituents, function() {
      csvData += '\n' + 
                 this.ConsId + ',' + 
                 '"' + this.ConsName.FirstName.replace(/"/g, '""') + '",' + 
                 '"' + this.ConsName.LastName.replace(/"/g, '""') + '",' + 
                 this.PrimaryEmail + ',' + 
                 this.HomeAddress.City + ',' + 
                 this.HomeAddress.State + ',' + 
                 this._CreationDateFormatted;
    });
    
    $('.js--report-save-as').off('change').on('change', function() {
      require('fs').writeFile($(this).val(), csvData, function(error) {
        if(error) {
          /* TODO */
        }
      });
    }).click();  
  };
}]);