angular.module 'dataViewerApp'
  .factory 'DataTableService', [
    ->
      service =
        init: (selector, options) ->
          this.destroy selector
          settings = $.extend
            'searching': false
            'info': true
            'paging': true
            'lengthChange': false
            'ordering': true
            'order': [
              [0, 'desc']
            ]
            'autoWidth': false
            'dom': '<".table-responsive"t>ip'
          , options or {}
          $(selector).DataTable settings
        destroy: (selector) ->
          $(selector).DataTable().destroy()
      service
  ]