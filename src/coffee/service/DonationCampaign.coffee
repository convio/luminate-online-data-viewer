angular.module 'dataViewerApp'
  .factory 'DonationCampaignService', [
    'WebServicesService'
    (WebServicesService) ->
      donationCampaignCache = []
      service =
        getDonationCampaigns: (options) ->
          _this = this
          settings = $.extend
            page: '1'
            fault: $.noop
            success: $.noop
            complete: $.noop
          , options or {}
          if Number(settings.page) is 1 and donationCampaignCache.length > 0
            settings.success donationCampaignCache
            settings.complete()
          else
            WebServicesService.query
              statement: 'select CampaignId, Title' + 
                         ' from DonationCampaign' + 
                         ' where IsArchived = \'false\''
              page: settings.page
              error: ->
                angular.noop()
              success: (response) ->
                $faultstring = $(response).find 'faultstring'
                if $faultstring.length > 0
                  settings.fault $faultstring.text()
                else
                  donationCampaigns = []
                  $records = $(response).find 'Record'
                  if $records.length is 0
                    settings.success donationCampaigns
                  else
                    $records.each ->
                      campaignId = $(this).find('CampaignId').text()
                      campaignTitle = $(this).find('Title').text()
                      donationCampaign =
                        'CampaignId': campaignId
                        'Title': campaignTitle
                      donationCampaigns.push donationCampaign
                      donationCampaignCache.push donationCampaign
                    settings.success donationCampaigns
                  if $records.length is 200
                    nextPageSettings = $.extend {}, settings
                    nextPageSettings.page = '' + (Number(settings.page) + 1)
                    _this.getDonationCampaigns nextPageSettings
                  else
                    settings.complete()
      service
  ]