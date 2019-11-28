angular.module 'dataViewerApp'
  .factory 'DonationFormService', [
    'WebServicesService'
    (WebServicesService) ->
      donationFormCache = []
      service =
        getDonationForms: (options) ->
          _this = this
          settings = $.extend
            page: '1'
            fault: $.noop
            success: $.noop
            complete: $.noop
          , options or {}
          if Number(settings.page) is 1 and donationFormCache.length > 0
            settings.success donationFormCache
            settings.complete()
          else
            WebServicesService.query
              statement: 'select FormId, CampaignId, Title' + 
                         ' from DonationForm' + 
                         ' where IsArchived = \'false\''
              page: settings.page
              error: ->
                angular.noop()
              success: (response) ->
                $faultstring = $(response).find 'faultstring'
                if $faultstring.length > 0
                  settings.fault $faultstring.text()
                else
                  donationForms = []
                  $records = $(response).find 'Record'
                  if $records.length is 0
                    settings.success donationForms
                  else
                    $records.each ->
                      formId = $(this).find('FormId').text()
                      campaignId = $(this).find('CampaignId').text()
                      formTitle = $(this).find('Title').text()
                      donationForm =
                        'FormId': formId
                        'CampaignId': campaignId
                        'Title': formTitle
                      donationForms.push donationForm
                      donationFormCache.push donationForm
                    settings.success donationForms
                  if $records.length is 200
                    nextPageSettings = $.extend {}, settings
                    nextPageSettings.page = '' + (Number(settings.page) + 1)
                    _this.getDonationForms nextPageSettings
                  else
                    settings.complete()
      service
  ]