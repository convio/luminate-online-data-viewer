angular.module 'dataViewerApp'
  .factory 'ConstituentService', [
    'WebServicesService'
    (WebServicesService) ->
      service =
        getConstituents: (options) ->
          _this = this
          settings = $.extend
            page: '1'
            fault: $.noop
            success: $.noop
            complete: $.noop
          , options or {}
          
          if not settings.startDate or settings.startDate is ''
            settings.startDate = moment().subtract(1, 'days').format 'YYYY-MM-DD[T]HH:mm:ssZ'
          if not settings.endDate or settings.endDate is ''
            settings.endDate = moment(settings.startDate).add(1, 'days').format 'YYYY-MM-DD[T]HH:mm:ssZ'
          
          WebServicesService.query
            statement: 'select ConsId,' + 
                       ' ConsName.FirstName, ConsName.LastName,' + 
                       ' CreationDate, PrimaryEmail,' + 
                       ' HomeAddress.City, HomeAddress.State' + 
                       ' from Constituent' + 
                       ' where CreationDate &gt;= ' + settings.startDate + 
                       ' and CreationDate &lt;= ' + settings.endDate
            page: settings.page
            error: ->
              angular.noop()
            success: (response) ->
              $faultstring = $(response).find 'faultstring'
              if $faultstring.length > 0
                settings.fault $faultstring.text()
              else
                constituents = []
                $records = $(response).find 'Record'
                if $records.length is 0
                  settings.success constituents
                else
                  $records.each ->
                    consId = $(this).find('ConsId').text()
                    $consName = $(this).find 'ConsName'
                    consFirstName = $consName.find('FirstName').text()
                    consLastName = $consName.find('LastName').text()
                    consCreationDate = $(this).find('CreationDate').text()
                    consCreationDateFormatted = moment(consCreationDate).format 'MM/DD/YYYY h:mma'
                    consPrimaryEmail = $(this).find('PrimaryEmail').text()
                    $consHomeAddress = $(this).find 'HomeAddress'
                    consHomeCity = $consHomeAddress.find('City').text()
                    consHomeState = $consHomeAddress.find('State').text()
                    constituent =
                      'ConsId': consId
                      'ConsName':
                        'FirstName': consFirstName
                        'LastName': consLastName
                      'CreationDate': consCreationDate
                      '_CreationDateFormatted': consCreationDateFormatted
                      'PrimaryEmail': consPrimaryEmail
                      'HomeAddress':
                        'City': consHomeCity
                        'State': consHomeState
                    constituents.push constituent
                  settings.success constituents
                if $records.length is 200
                  nextPageSettings = $.extend {}, settings
                  nextPageSettings.page = '' + (Number(settings.page) + 1)
                  _this.getConstituents nextPageSettings
                else
                  settings.complete()
      service
  ]