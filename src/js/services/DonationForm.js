dataViewerApp.factory('DonationFormService', ['WebServicesService', function(WebServicesService) {
  var donationFormCache = [];
  
  return {
    getDonationForms: function(options) {
      var _this = this, 
      settings = $.extend({
        page: '1', 
        fault: $.noop, 
        success: $.noop, 
        complete: $.noop
      }, options || {});
      
      if(Number(settings.page) === 1 && donationFormCache.length > 0) {
        settings.success(donationFormCache);
        
        settings.complete();
      }
      else {
        WebServicesService.query({
          statement: 'select FormId, CampaignId, Title' + 
                     ' from DonationForm' + 
                     ' where IsArchived = \'false\'', 
          page: settings.page, 
          error: function() {
            /* TODO */
          }, 
          success: function(response) {
            var $faultstring = $(response).find('faultstring');
            
            if($faultstring.length > 0) {
              settings.fault($faultstring.text());
            }
            else {
              var donationForms = [], 
              $records = $(response).find('Record');
              
              if($records.length === 0) {
                settings.success(donationForms)
              }
              else {
                $records.each(function() {
                  var formId = $(this).find('ens\\:FormId').text(), 
                  campaignId = $(this).find('ens\\:CampaignId').text(), 
                  formTitle = $(this).find('ens\\:Title').text();
                  
                  var donationForm = {
                    'FormId': formId, 
                    'CampaignId': campaignId, 
                    'Title': formTitle
                  };
                  
                  donationForms.push(donationForm);
                  
                  donationFormCache.push(donationForm);
                });
                
                settings.success(donationForms);
              }
              
              if($records.length === 200) {
                var nextPageSettings = $.extend({}, settings);
                
                nextPageSettings.page = '' + (Number(settings.page) + 1);
                
                _this.getDonationForms(nextPageSettings);
              }
              else {
                settings.complete();
              }
            }
          }
        });
      }
    }
  };
}]);