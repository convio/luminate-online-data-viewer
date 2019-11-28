angular.module 'dataViewerApp'
  .factory 'StorageService', [
    ->
      service =
        storeData: (propertyName, propertyValue, useSessionStorage) ->
          if $.type(propertyValue) is 'object'
            propertyValue = JSON.stringify propertyValue
          if useSessionStorage is true
            sessionStorage['dv__' + propertyName] = propertyValue
          else
            localStorage['dv__' + propertyName] = propertyValue
        deleteStoredData: (propertyName) ->
          if sessionStorage['dv__' + propertyName]
            delete sessionStorage['dv__' + propertyName]
          if localStorage['dv__' + propertyName]
            delete localStorage['dv__' + propertyName]
        getStoredData: (propertyName) ->
          propertyValue = null
          if sessionStorage['dv__' + propertyName]
            propertyValue = sessionStorage['dv__' + propertyName]
          else if localStorage['dv__' + propertyName]
            propertyValue = localStorage['dv__' + propertyName]
          try
            propertyValue = JSON.parse propertyValue
          catch e
          propertyValue
      service
  ]