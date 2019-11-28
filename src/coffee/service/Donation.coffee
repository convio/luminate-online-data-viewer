angular.module 'dataViewerApp'
  .factory 'DonationService', [
    'WebServicesService'
    (WebServicesService) ->
      service =
        getDonations: (options) ->
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
            statement: 'select TransactionId, CampaignId, FormId,' + 
                       ' Payment.Amount, Payment.PaymentDate, Payment.TenderType, Payment.CreditCardType,' + 
                       ' Donor.ConsName.FirstName, Donor.ConsName.LastName,' + 
                       ' Donor.PrimaryEmail,' + 
                       ' Donor.HomeAddress.City, Donor.HomeAddress.State,' + 
                       ' RecurringPayment.OriginalTransactionId' + 
                       ' from Donation' + 
                       ' where Payment.PaymentDate &gt;= ' + settings.startDate + 
                       ' and Payment.PaymentDate &lt;=' + settings.endDate + 
                       (if settings.campaignId and settings.campaignId isnt '' then (' and CampaignId = ' + settings.campaignId) else '') + 
                       (if settings.formId and settings.formId isnt '' then (' and FormId = ' + settings.formId) else '')
            page: settings.page
            error: ->
              angular.noop()
            success: (response) ->
              $faultstring = $(response).find 'faultstring'
              if $faultstring.length > 0
                settings.fault $faultstring.text()
              else
                donations = []
                $records = $(response).find 'Record'
                if $records.length is 0
                  settings.success donations
                else
                  $records.each ->
                    transactionId = $(this).find('TransactionId').text()
                    campaignId = $(this).find('CampaignId').text()
                    formId = $(this).find('FormId').text()
                    $payment = $(this).find 'Payment'
                    paymentAmount = Number $payment.find('Amount').text()
                    paymentAmountFormatted = paymentAmount.toLocaleString 'en',
                      style: 'currency'
                      currency: 'USD'
                      minimumFractionDigits: 2
                    paymentDate = $payment.find('PaymentDate').text()
                    paymentDateFormatted = moment(paymentDate).format 'MM/DD/YYYY h:mma'
                    paymentTenderType = $payment.find('TenderType').text()
                    paymentTenderTypeFormatted = ''
                    paymentCreditCardType = $payment.find('CreditCardType').text()
                    $donor = $(this).find 'Donor'
                    $donorName = $donor.find 'ConsName'
                    donorFirstName = $donorName.find('FirstName').text()
                    donorLastName = $donorName.find('LastName').text()
                    donorPrimaryEmail = $donor.find('PrimaryEmail').text()
                    $donorHomeAddress = $(this).find 'HomeAddress'
                    donorHomeCity = $donorHomeAddress.find('City').text()
                    donorHomeState = $donorHomeAddress.find('State').text()
                    $recurringPayment = $(this).find 'RecurringPayment'
                    originalTransactionId = transactionId
                    donationType = 'One-Time'
                    switch paymentTenderType.toLowerCase()
                      when 'credit_card'
                        paymentTenderTypeFormatted = 'Credit'
                      when 'check'
                        paymentTenderTypeFormatted = 'Check'
                      when 'cash'
                        paymentTenderTypeFormatted = 'Cash'
                      when 'ach'
                        paymentTenderTypeFormatted = 'ACH'
                      when 'x_checkout'
                        if paymentCreditCardType.toLowerCase() is 'paypal'
                          paymentTenderTypeFormatted = 'PayPal'
                        else
                          paymentTenderTypeFormatted = 'X-Checkout'
                    if $recurringPayment.length > 0
                      donationType = 'Sustaining'
                    donation =
                      'TransactionId': transactionId
                      'CampaignId': campaignId
                      'FormId': formId
                      'Payment':
                        'Amount': paymentAmount
                        '_AmountFormatted': paymentAmountFormatted
                        'PaymentDate': paymentDate
                        '_PaymentDateFormatted': paymentDateFormatted
                        'TenderType': paymentTenderType
                        '_TenderTypeFormatted': paymentTenderTypeFormatted
                      'Donor':
                        'ConsName':
                          'FirstName': donorFirstName
                          'LastName': donorLastName
                        'PrimaryEmail': donorPrimaryEmail
                        'HomeAddress':
                          'City': donorHomeCity
                          'State': donorHomeState
                      '_DonationType': donationType
                    if $recurringPayment.length > 0
                      originalTransactionId = $recurringPayment.find('OriginalTransactionId').text()
                      donation.RecurringPayment =
                        'OriginalTransactionId': originalTransactionId
                    donations.push donation
                  settings.success donations
                if $records.length is 200
                  nextPageSettings = $.extend {}, settings
                  nextPageSettings.page = '' + (Number(settings.page) + 1)
                  _this.getDonations nextPageSettings
                else
                  settings.complete()
      service
  ]