/*! AdminLTE app.js
 * ================
 * Main JS application file for AdminLTE v2. This file
 * should be included in all pages. It controls some layout
 * options and implements exclusive AdminLTE plugins.
 *
 * @Author  Almsaeed Studio
 * @Support <http://www.almsaeedstudio.com>
 * @Email   <support@almsaeedstudio.com>
 * @version 2.3.1
 * @license MIT <http://opensource.org/licenses/MIT>
 */

//Make sure jQuery has been loaded before app.js
if (typeof jQuery === "undefined") {
  throw new Error("AdminLTE requires jQuery");
}

/* AdminLTE
 *
 * @type Object
 * @description $.AdminLTE is the main object for the template's app.
 *              It's used for implementing functions and options related
 *              to the template. Keeping everything wrapped in an object
 *              prevents conflict with other plugins and is a better
 *              way to organize our code.
 */
$.AdminLTE = {};

/* --------------------
 * - AdminLTE Options -
 * --------------------
 * Modify these options to suit your implementation
 */
$.AdminLTE.options = {
  //Add slimscroll to navbar menus
  //This requires you to load the slimscroll plugin
  //in every page before app.js
  navbarMenuSlimscroll: true,
  navbarMenuSlimscrollWidth: "3px", //The width of the scroll bar
  navbarMenuHeight: "200px", //The height of the inner menu
  //General animation speed for JS animated elements such as box collapse/expand and
  //sidebar treeview slide up/down. This options accepts an integer as milliseconds,
  //'fast', 'normal', or 'slow'
  animationSpeed: 500,
  //Sidebar push menu toggle button selector
  sidebarToggleSelector: "[data-toggle='offcanvas']",
  //Activate sidebar push menu
  sidebarPushMenu: true,
  //Activate sidebar slimscroll if the fixed layout is set (requires SlimScroll Plugin)
  sidebarSlimScroll: true,
  //Enable sidebar expand on hover effect for sidebar mini
  //This option is forced to true if both the fixed layout and sidebar mini
  //are used together
  sidebarExpandOnHover: false,
  //BoxRefresh Plugin
  enableBoxRefresh: true,
  //Bootstrap.js tooltip
  enableBSToppltip: true,
  BSTooltipSelector: "[data-toggle='tooltip']",
  //Enable Fast Click. Fastclick.js creates a more
  //native touch experience with touch devices. If you
  //choose to enable the plugin, make sure you load the script
  //before AdminLTE's app.js
  enableFastclick: true,
  //Control Sidebar Options
  enableControlSidebar: true,
  controlSidebarOptions: {
    //Which button should trigger the open/close event
    toggleBtnSelector: "[data-toggle='control-sidebar']",
    //The sidebar selector
    selector: ".control-sidebar",
    //Enable slide over content
    slide: true
  },
  //Box Widget Plugin. Enable this plugin
  //to allow boxes to be collapsed and/or removed
  enableBoxWidget: true,
  //Box Widget plugin options
  boxWidgetOptions: {
    boxWidgetIcons: {
      //Collapse icon
      collapse: 'fa-minus',
      //Open icon
      open: 'fa-plus',
      //Remove icon
      remove: 'fa-times'
    },
    boxWidgetSelectors: {
      //Remove button selector
      remove: '[data-widget="remove"]',
      //Collapse button selector
      collapse: '[data-widget="collapse"]'
    }
  },
  //Direct Chat plugin options
  directChat: {
    //Enable direct chat by default
    enable: true,
    //The button to open and close the chat contacts pane
    contactToggleSelector: '[data-widget="chat-pane-toggle"]'
  },
  //Define the set of colors to use globally around the website
  colors: {
    lightBlue: "#3c8dbc",
    red: "#f56954",
    green: "#00a65a",
    aqua: "#00c0ef",
    yellow: "#f39c12",
    blue: "#0073b7",
    navy: "#001F3F",
    teal: "#39CCCC",
    olive: "#3D9970",
    lime: "#01FF70",
    orange: "#FF851B",
    fuchsia: "#F012BE",
    purple: "#8E24AA",
    maroon: "#D81B60",
    black: "#222222",
    gray: "#d2d6de"
  },
  //The standard screen sizes that bootstrap uses.
  //If you change these in the variables.less file, change
  //them here too.
  screenSizes: {
    xs: 480,
    sm: 768,
    md: 992,
    lg: 1200
  }
};

/* ------------------
 * - Implementation -
 * ------------------
 * The next block of code implements AdminLTE's
 * functions and plugins as specified by the
 * options above.
 */
$(function () {
  "use strict";

  //Fix for IE page transitions
  $("body").removeClass("hold-transition");

  //Extend options if external options exist
  if (typeof AdminLTEOptions !== "undefined") {
    $.extend(true,
        $.AdminLTE.options,
        AdminLTEOptions);
  }

  //Easy access to options
  var o = $.AdminLTE.options;

  //Set up the object
  _init();

  //Activate the layout maker
  $.AdminLTE.layout.activate();

  //Enable sidebar tree view controls
  $.AdminLTE.tree('.sidebar');

  //Enable control sidebar
  if (o.enableControlSidebar) {
    $.AdminLTE.controlSidebar.activate();
  }

  //Add slimscroll to navbar dropdown
  if (o.navbarMenuSlimscroll && typeof $.fn.slimscroll != 'undefined') {
    $(".navbar .menu").slimscroll({
      height: o.navbarMenuHeight,
      alwaysVisible: false,
      size: o.navbarMenuSlimscrollWidth
    }).css("width", "100%");
  }

  //Activate sidebar push menu
  if (o.sidebarPushMenu) {
    $.AdminLTE.pushMenu.activate(o.sidebarToggleSelector);
  }

  //Activate Bootstrap tooltip
  if (o.enableBSToppltip) {
    $('body').tooltip({
      selector: o.BSTooltipSelector
    });
  }

  //Activate box widget
  if (o.enableBoxWidget) {
    $.AdminLTE.boxWidget.activate();
  }

  //Activate fast click
  if (o.enableFastclick && typeof FastClick != 'undefined') {
    FastClick.attach(document.body);
  }

  //Activate direct chat widget
  if (o.directChat.enable) {
    $(document).on('click', o.directChat.contactToggleSelector, function () {
      var box = $(this).parents('.direct-chat').first();
      box.toggleClass('direct-chat-contacts-open');
    });
  }

  /*
   * INITIALIZE BUTTON TOGGLE
   * ------------------------
   */
  $('.btn-group[data-toggle="btn-toggle"]').each(function () {
    var group = $(this);
    $(this).find(".btn").on('click', function (e) {
      group.find(".btn.active").removeClass("active");
      $(this).addClass("active");
      e.preventDefault();
    });

  });
});

/* ----------------------------------
 * - Initialize the AdminLTE Object -
 * ----------------------------------
 * All AdminLTE functions are implemented below.
 */
function _init() {
  'use strict';
  /* Layout
   * ======
   * Fixes the layout height in case min-height fails.
   *
   * @type Object
   * @usage $.AdminLTE.layout.activate()
   *        $.AdminLTE.layout.fix()
   *        $.AdminLTE.layout.fixSidebar()
   */
  $.AdminLTE.layout = {
    activate: function () {
      var _this = this;
      _this.fix();
      _this.fixSidebar();
      $(window, ".wrapper").resize(function () {
        _this.fix();
        _this.fixSidebar();
      });
    },
    fix: function () {
      //Get window height and the wrapper height
      var neg = $('.main-header').outerHeight() + $('.main-footer').outerHeight();
      var window_height = $(window).height();
      var sidebar_height = $(".sidebar").height();
      //Set the min-height of the content and sidebar based on the
      //the height of the document.
      if ($("body").hasClass("fixed")) {
        $(".content-wrapper, .right-side").css('min-height', window_height - $('.main-footer').outerHeight());
      } else {
        var postSetWidth;
        if (window_height >= sidebar_height) {
          $(".content-wrapper, .right-side").css('min-height', window_height - neg);
          postSetWidth = window_height - neg;
        } else {
          $(".content-wrapper, .right-side").css('min-height', sidebar_height);
          postSetWidth = sidebar_height;
        }

        //Fix for the control sidebar height
        var controlSidebar = $($.AdminLTE.options.controlSidebarOptions.selector);
        if (typeof controlSidebar !== "undefined") {
          if (controlSidebar.height() > postSetWidth)
            $(".content-wrapper, .right-side").css('min-height', controlSidebar.height());
        }

      }
    },
    fixSidebar: function () {
      //Make sure the body tag has the .fixed class
      if (!$("body").hasClass("fixed")) {
        if (typeof $.fn.slimScroll != 'undefined') {
          $(".sidebar").slimScroll({destroy: true}).height("auto");
        }
        return;
      } else if (typeof $.fn.slimScroll == 'undefined' && window.console) {
        window.console.error("Error: the fixed layout requires the slimscroll plugin!");
      }
      //Enable slimscroll for fixed layout
      if ($.AdminLTE.options.sidebarSlimScroll) {
        if (typeof $.fn.slimScroll != 'undefined') {
          //Destroy if it exists
          $(".sidebar").slimScroll({destroy: true}).height("auto");
          //Add slimscroll
          $(".sidebar").slimscroll({
            height: ($(window).height() - $(".main-header").height()) + "px",
            color: "rgba(0,0,0,0.2)",
            size: "3px"
          });
        }
      }
    }
  };

  /* PushMenu()
   * ==========
   * Adds the push menu functionality to the sidebar.
   *
   * @type Function
   * @usage: $.AdminLTE.pushMenu("[data-toggle='offcanvas']")
   */
  $.AdminLTE.pushMenu = {
    activate: function (toggleBtn) {
      //Get the screen sizes
      var screenSizes = $.AdminLTE.options.screenSizes;

      //Enable sidebar toggle
      $(toggleBtn).on('click', function (e) {
        e.preventDefault();

        //Enable sidebar push menu
        if ($(window).width() > (screenSizes.sm - 1)) {
          if ($("body").hasClass('sidebar-collapse')) {
            $("body").removeClass('sidebar-collapse').trigger('expanded.pushMenu');
          } else {
            $("body").addClass('sidebar-collapse').trigger('collapsed.pushMenu');
          }
        }
        //Handle sidebar push menu for small screens
        else {
          if ($("body").hasClass('sidebar-open')) {
            $("body").removeClass('sidebar-open').removeClass('sidebar-collapse').trigger('collapsed.pushMenu');
          } else {
            $("body").addClass('sidebar-open').trigger('expanded.pushMenu');
          }
        }
      });

      $(".content-wrapper").click(function () {
        //Enable hide menu when clicking on the content-wrapper on small screens
        if ($(window).width() <= (screenSizes.sm - 1) && $("body").hasClass("sidebar-open")) {
          $("body").removeClass('sidebar-open');
        }
      });

      //Enable expand on hover for sidebar mini
      if ($.AdminLTE.options.sidebarExpandOnHover
          || ($('body').hasClass('fixed')
          && $('body').hasClass('sidebar-mini'))) {
        this.expandOnHover();
      }
    },
    expandOnHover: function () {
      var _this = this;
      var screenWidth = $.AdminLTE.options.screenSizes.sm - 1;
      //Expand sidebar on hover
      $('.main-sidebar').hover(function () {
        if ($('body').hasClass('sidebar-mini')
            && $("body").hasClass('sidebar-collapse')
            && $(window).width() > screenWidth) {
          _this.expand();
        }
      }, function () {
        if ($('body').hasClass('sidebar-mini')
            && $('body').hasClass('sidebar-expanded-on-hover')
            && $(window).width() > screenWidth) {
          _this.collapse();
        }
      });
    },
    expand: function () {
      $("body").removeClass('sidebar-collapse').addClass('sidebar-expanded-on-hover');
    },
    collapse: function () {
      if ($('body').hasClass('sidebar-expanded-on-hover')) {
        $('body').removeClass('sidebar-expanded-on-hover').addClass('sidebar-collapse');
      }
    }
  };

  /* Tree()
   * ======
   * Converts the sidebar into a multilevel
   * tree view menu.
   *
   * @type Function
   * @Usage: $.AdminLTE.tree('.sidebar')
   */
  $.AdminLTE.tree = function (menu) {
    var _this = this;
    var animationSpeed = $.AdminLTE.options.animationSpeed;
    $(document).on('click', menu + ' li a', function (e) {
      //Get the clicked link and the next element
      var $this = $(this);
      var checkElement = $this.next();

      //Check if the next element is a menu and is visible
      if ((checkElement.is('.treeview-menu')) && (checkElement.is(':visible'))) {
        //Close the menu
        checkElement.slideUp(animationSpeed, function () {
          checkElement.removeClass('menu-open');
          //Fix the layout in case the sidebar stretches over the height of the window
          //_this.layout.fix();
        });
        checkElement.parent("li").removeClass("active");
      }
      //If the menu is not visible
      else if ((checkElement.is('.treeview-menu')) && (!checkElement.is(':visible'))) {
        //Get the parent menu
        var parent = $this.parents('ul').first();
        //Close all open menus within the parent
        var ul = parent.find('ul:visible').slideUp(animationSpeed);
        //Remove the menu-open class from the parent
        ul.removeClass('menu-open');
        //Get the parent li
        var parent_li = $this.parent("li");

        //Open the target menu and add the menu-open class
        checkElement.slideDown(animationSpeed, function () {
          //Add the class active to the parent li
          checkElement.addClass('menu-open');
          parent.find('li.active').removeClass('active');
          parent_li.addClass('active');
          //Fix the layout in case the sidebar stretches over the height of the window
          _this.layout.fix();
        });
      }
      //if this isn't a link, prevent the page from being redirected
      if (checkElement.is('.treeview-menu')) {
        e.preventDefault();
      }
    });
  };

  /* ControlSidebar
   * ==============
   * Adds functionality to the right sidebar
   *
   * @type Object
   * @usage $.AdminLTE.controlSidebar.activate(options)
   */
  $.AdminLTE.controlSidebar = {
    //instantiate the object
    activate: function () {
      //Get the object
      var _this = this;
      //Update options
      var o = $.AdminLTE.options.controlSidebarOptions;
      //Get the sidebar
      var sidebar = $(o.selector);
      //The toggle button
      var btn = $(o.toggleBtnSelector);

      //Listen to the click event
      btn.on('click', function (e) {
        e.preventDefault();
        //If the sidebar is not open
        if (!sidebar.hasClass('control-sidebar-open')
            && !$('body').hasClass('control-sidebar-open')) {
          //Open the sidebar
          _this.open(sidebar, o.slide);
        } else {
          _this.close(sidebar, o.slide);
        }
      });

      //If the body has a boxed layout, fix the sidebar bg position
      var bg = $(".control-sidebar-bg");
      _this._fix(bg);

      //If the body has a fixed layout, make the control sidebar fixed
      if ($('body').hasClass('fixed')) {
        _this._fixForFixed(sidebar);
      } else {
        //If the content height is less than the sidebar's height, force max height
        if ($('.content-wrapper, .right-side').height() < sidebar.height()) {
          _this._fixForContent(sidebar);
        }
      }
    },
    //Open the control sidebar
    open: function (sidebar, slide) {
      //Slide over content
      if (slide) {
        sidebar.addClass('control-sidebar-open');
      } else {
        //Push the content by adding the open class to the body instead
        //of the sidebar itself
        $('body').addClass('control-sidebar-open');
      }
    },
    //Close the control sidebar
    close: function (sidebar, slide) {
      if (slide) {
        sidebar.removeClass('control-sidebar-open');
      } else {
        $('body').removeClass('control-sidebar-open');
      }
    },
    _fix: function (sidebar) {
      var _this = this;
      if ($("body").hasClass('layout-boxed')) {
        sidebar.css('position', 'absolute');
        sidebar.height($(".wrapper").height());
        $(window).resize(function () {
          _this._fix(sidebar);
        });
      } else {
        sidebar.css({
          'position': 'fixed',
          'height': 'auto'
        });
      }
    },
    _fixForFixed: function (sidebar) {
      sidebar.css({
        'position': 'fixed',
        'max-height': '100%',
        'overflow': 'auto',
        'padding-bottom': '50px'
      });
    },
    _fixForContent: function (sidebar) {
      $(".content-wrapper, .right-side").css('min-height', sidebar.height());
    }
  };

  /* BoxWidget
   * =========
   * BoxWidget is a plugin to handle collapsing and
   * removing boxes from the screen.
   *
   * @type Object
   * @usage $.AdminLTE.boxWidget.activate()
   *        Set all your options in the main $.AdminLTE.options object
   */
  $.AdminLTE.boxWidget = {
    selectors: $.AdminLTE.options.boxWidgetOptions.boxWidgetSelectors,
    icons: $.AdminLTE.options.boxWidgetOptions.boxWidgetIcons,
    animationSpeed: $.AdminLTE.options.animationSpeed,
    activate: function (_box) {
      var _this = this;
      if (!_box) {
        _box = document; // activate all boxes per default
      }
      //Listen for collapse event triggers
      $(_box).on('click', _this.selectors.collapse, function (e) {
        e.preventDefault();
        _this.collapse($(this));
      });

      //Listen for remove event triggers
      $(_box).on('click', _this.selectors.remove, function (e) {
        e.preventDefault();
        _this.remove($(this));
      });
    },
    collapse: function (element) {
      var _this = this;
      //Find the box parent
      var box = element.parents(".box").first();
      //Find the body and the footer
      var box_content = box.find("> .box-body, > .box-footer, > form  >.box-body, > form > .box-footer");
      if (!box.hasClass("collapsed-box")) {
        //Convert minus into plus
        element.children(":first")
            .removeClass(_this.icons.collapse)
            .addClass(_this.icons.open);
        //Hide the content
        box_content.slideUp(_this.animationSpeed, function () {
          box.addClass("collapsed-box");
        });
      } else {
        //Convert plus into minus
        element.children(":first")
            .removeClass(_this.icons.open)
            .addClass(_this.icons.collapse);
        //Show the content
        box_content.slideDown(_this.animationSpeed, function () {
          box.removeClass("collapsed-box");
        });
      }
    },
    remove: function (element) {
      //Find the box parent
      var box = element.parents(".box").first();
      box.slideUp(this.animationSpeed);
    }
  };
}

/* ------------------
 * - Custom Plugins -
 * ------------------
 * All custom plugins are defined below.
 */

/*
 * BOX REFRESH BUTTON
 * ------------------
 * This is a custom plugin to use with the component BOX. It allows you to add
 * a refresh button to the box. It converts the box's state to a loading state.
 *
 * @type plugin
 * @usage $("#box-widget").boxRefresh( options );
 */
(function ($) {

  "use strict";

  $.fn.boxRefresh = function (options) {

    // Render options
    var settings = $.extend({
      //Refresh button selector
      trigger: ".refresh-btn",
      //File source to be loaded (e.g: ajax/src.php)
      source: "",
      //Callbacks
      onLoadStart: function (box) {
        return box;
      }, //Right after the button has been clicked
      onLoadDone: function (box) {
        return box;
      } //When the source has been loaded

    }, options);

    //The overlay
    var overlay = $('<div class="overlay"><div class="fa fa-refresh fa-spin"></div></div>');

    return this.each(function () {
      //if a source is specified
      if (settings.source === "") {
        if (window.console) {
          window.console.log("Please specify a source first - boxRefresh()");
        }
        return;
      }
      //the box
      var box = $(this);
      //the button
      var rBtn = box.find(settings.trigger).first();

      //On trigger click
      rBtn.on('click', function (e) {
        e.preventDefault();
        //Add loading overlay
        start(box);

        //Perform ajax call
        box.find(".box-body").load(settings.source, function () {
          done(box);
        });
      });
    });

    function start(box) {
      //Add overlay and loading img
      box.append(overlay);

      settings.onLoadStart.call(box);
    }

    function done(box) {
      //Remove overlay and loading img
      box.find(overlay).remove();

      settings.onLoadDone.call(box);
    }

  };

})(jQuery);

/*
 * EXPLICIT BOX ACTIVATION
 * -----------------------
 * This is a custom plugin to use with the component BOX. It allows you to activate
 * a box inserted in the DOM after the app.js was loaded.
 *
 * @type plugin
 * @usage $("#box-widget").activateBox();
 */
(function ($) {

  'use strict';

  $.fn.activateBox = function () {
    $.AdminLTE.boxWidget.activate(this);
  };

})(jQuery);

/*
 * TODO LIST CUSTOM PLUGIN
 * -----------------------
 * This plugin depends on iCheck plugin for checkbox and radio inputs
 *
 * @type plugin
 * @usage $("#todo-widget").todolist( options );
 */
(function ($) {

  'use strict';

  $.fn.todolist = function (options) {
    // Render options
    var settings = $.extend({
      //When the user checks the input
      onCheck: function (ele) {
        return ele;
      },
      //When the user unchecks the input
      onUncheck: function (ele) {
        return ele;
      }
    }, options);

    return this.each(function () {

      if (typeof $.fn.iCheck != 'undefined') {
        $('input', this).on('ifChecked', function () {
          var ele = $(this).parents("li").first();
          ele.toggleClass("done");
          settings.onCheck.call(ele);
        });

        $('input', this).on('ifUnchecked', function () {
          var ele = $(this).parents("li").first();
          ele.toggleClass("done");
          settings.onUncheck.call(ele);
        });
      } else {
        $('input', this).on('change', function () {
          var ele = $(this).parents("li").first();
          ele.toggleClass("done");
          if ($('input', ele).is(":checked")) {
            settings.onCheck.call(ele);
          } else {
            settings.onUncheck.call(ele);
          }
        });
      }
    });
  };
}(jQuery));

var dataViewerApp = angular.module('dataViewerApp', [
  'ngRoute', 
  'ui.bootstrap', 
  'dataViewerControllers'
]), 
dataViewerControllers = angular.module('dataViewerControllers', []);

dataViewerApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'views/login.html', 
    controller: 'LoginViewController'
  }).when('/report-constituents', {
    templateUrl: 'views/report-constituents.html', 
    controller: 'ConstituentsReportViewController'
  }).when('/report-donations', {
    templateUrl: 'views/report-donations.html', 
    controller: 'DonationsReportViewController'
  }).when('/report-ecommerce', {
    templateUrl: 'views/report-ecommerce.html', 
    controller: 'EcommerceReportViewController'
  }).otherwise({
    redirectTo: '/login'
  });
}]);

dataViewerApp.directive('mainHeader', function() {
  return {
    restrict: 'A', 
    replace: true
  }
});

dataViewerApp.directive('mainSidebar', function() {
  return {
    restrict: 'A', 
    replace: true
  }
});

dataViewerApp.value('Session', {});

dataViewerApp.factory('SessionService', ['Session', function(Session) {
  return {
    setSessionId: function(SessionId) {
      dataViewerApp.value('Session', $.extend(Session, {
        id: SessionId
      }));
    }, 
    
    getSessionId: function() {
      return Session.id;
    }, 
    
    reset: function() {
      Session = {};
    }
  };
}]);

dataViewerApp.value('WebServices', {});

dataViewerApp.factory('WebServicesService', ['WebServices', 'SessionService', function(WebServices, SessionService) {
  return {
    setRequestUrl: function(requestUrl) {
      dataViewerApp.value('WebServices', $.extend(WebServices, {
        url: requestUrl
      }));
    }, 
    
    getRequestUrl: function() {
      return WebServices.url;
    }, 
    
    request: function(options) {
      var settings = $.extend({
        includeSessionId: true, 
        error: $.noop, 
        success: $.noop
      }, options || {}), 
      requestUrl = this.getRequestUrl();
      
      if(!requestUrl) {
        /* TODO */
      }
      else {
        var sessionId;
        
        if(settings.includeSessionId) {
          sessionId = SessionService.getSessionId();
        }
        
        $.ajax({
          url: requestUrl, 
          type: 'POST', 
          data: '<?xml version=\'1.0\' encoding=\'UTF-8\' ?>' + 
                '<soap:Envelope xmlns:soap=\'http://schemas.xmlsoap.org/soap/envelope/\'>' + 
                  (settings.includeSessionId && sessionId ? ('<soap:Header>' + 
                     '<Session xmlns=\'urn:soap.convio.com\'>' + 
                       '<SessionId>' + 
                         sessionId + 
                       '</SessionId>' + 
                     '</Session>'  + 
                   '</soap:Header>') : '') + 
                  (settings.body ? ('<soap:Body>' + 
                     settings.body + 
                   '</soap:Body>') : '') + 
                '</soap:Envelope>', 
          error: function(jqXHR, textStatus, errorThrown) {
            settings.error(errorThrown);
          }, 
          success: function(response) {
            var $faultcode = $(response).find('faultcode');
            
            if($faultcode.length > 0 && $faultcode.text() === 'fns:SESSION') {
              /* TODO: redirect to login */
            }
            else {
              settings.success(response);
            }
          }
        });
      }
    }, 
    
    login: function(options) {
      var settings = $.extend({
        error: $.noop, 
        success: $.noop
      }, options || {});
      
      this.setRequestUrl(settings.url);
      
      if(!settings.url) {
        /* TODO */
      }
      else if(!settings.username || !settings.password) {
        /* TODO */
      }
      else {
        SessionService.reset();
        
        this.request({
          includeSessionId: false, 
          body: '<Login xmlns=\'urn:soap.convio.com\'>' + 
                  '<UserName>' + 
                    settings.username + 
                  '</UserName>' + 
                  '<Password>' + 
                    settings.password + 
                  '</Password>' + 
                '</Login>', 
          error: settings.error, 
          success: function(response) {
            var $faultstring = $(response).find('faultstring');
            
            if($faultstring.length === 0) {
              SessionService.setSessionId($(response).find('SessionId').text());
            }
            
            settings.success(response);
          }
        });
      }
    }, 
    
    query: function(options) {
      var settings = $.extend({
        page: '1', 
        error: $.noop, 
        success: $.noop
      }, options || {});
      
      if(!settings.statement) {
        /* TODO */
      }
      else {
        this.request({
          body: '<Query xmlns=\'urn:soap.convio.com\'>' + 
                  '<QueryString>' + 
                    settings.statement + 
                  '</QueryString>' + 
                  '<Page>' + 
                    settings.page + 
                  '</Page>' + 
                  '<PageSize>200</PageSize>' + 
                '</Query>', 
          error: settings.error, 
          success: settings.success
        });
      }
    }
  };
}]);

dataViewerControllers.controller('ConstituentsReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.constituents = [];
  
  var addConstituent = function(constituent) {
    $scope.constituents.push(constituent);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  now = new Date(), 
  oneMonthAgo = new Date(now - (30 * 24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
  
  WebServicesService.query({
    statement: 'select ConsName, CreationDate, PrimaryEmail from Constituent where CreationDate >= ' + oneMonthAgo, 
    error: function() {
      /* TODO */
    }, 
    success: function(response) {
      var $faultstring = $(response).find('faultstring');
      
      if($faultstring.length > 0) {
        /* TODO */
      }
      else {
        var $records = $(response).find('Record');
        
        $records.each(function() {
          var $consName = $(this).find('ConsName'), 
          consFirstName = $consName.find('FirstName').text(), 
          consLastName = $consName.find('LastName').text(), 
          consCreationDate = $(this).find('CreationDate').text(), 
          consPrimaryEmail = $(this).find('PrimaryEmail').text();
          
          addConstituent({
            ConsName: {
              FirstName: consFirstName, 
              LastName: consLastName
            }, 
            CreationDate: consCreationDate, 
            PrimaryEmail: consPrimaryEmail
          });
        });
        
        $('.report-table').DataTable({
          'paging': true, /* TODO: only paginate if there are more results than one page */
          'lengthChange': false, 
          'searching': false, 
          'ordering': true, 
          'order': [
            [3, 'desc']
          ], 
          'info': true, 
          'autoWidth': false
        });
        
        $('.content .js--loading-overlay').addClass('hidden');
      }
    }
  });
}]);

dataViewerControllers.controller('DonationsReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.donations = [];
  
  var addDonation = function(donation) {
    $scope.donations.push(donation);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  now = new Date(), 
  oneMonthAgo = new Date(now - (30 * 24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
  
  WebServicesService.query({
    statement: 'select Payment.Amount, Payment.PaymentDate, Donor.ConsName, Donor.PrimaryEmail from Donation where Payment.PaymentDate >= ' + oneMonthAgo, 
    error: function() {
      /* TODO */
    }, 
    success: function(response) {
      var $faultstring = $(response).find('faultstring');
      
      if($faultstring.length > 0) {
        /* TODO */
      }
      else {
        var $records = $(response).find('Record');
        
        $records.each(function() {
          var $payment = $(this).find('Payment'), 
          paymentAmount = $payment.find('Amount').text(), 
          paymentDate = $payment.find('PaymentDate').text(), 
          $donor = $(this).find('Donor'), 
          $donorName = $donor.find('ConsName'), 
          donorFirstName = $donorName.find('FirstName').text(), 
          donorLastName = $donorName.find('LastName').text(), 
          donorPrimaryEmail = $donor.find('PrimaryEmail').text();
          
          addDonation({
            Payment: {
              Amount: paymentAmount, 
              PaymentDate: paymentDate
            }, 
            Donor: {
              ConsName: {
                FirstName: donorFirstName, 
                LastName: donorLastName
              }, 
              PrimaryEmail: donorPrimaryEmail
            }
          });
        });
        
        $('.report-table').DataTable({
          'paging': true, /* TODO: only paginate if there are more results than one page */
          'lengthChange': false, 
          'searching': false, 
          'ordering': true, 
          'order': [
            [4, 'desc']
          ], 
          'info': true, 
          'autoWidth': false
        });
        
        $('.content .js--loading-overlay').addClass('hidden');
      }
    }
  });
}]);

dataViewerControllers.controller('EcommerceReportViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  $.AdminLTE.layout.fix();
  
  $scope.orders = [];
  
  var addOrder = function(order) {
    $scope.orders.push(order);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }, 
  
  now = new Date(), 
  oneMonthAgo = new Date(now - (30 * 24 * 60 * 60 * 1000)).toISOString().split('.')[0] + '+00:00';
  
  WebServicesService.query({
    statement: 'select Payment.Amount, Payment.PaymentDate, Purchaser.ConsName, Purchaser.PrimaryEmail from ProductOrder where Payment.PaymentDate >= ' + oneMonthAgo, 
    error: function() {
      /* TODO */
    }, 
    success: function(response) {
      var $faultstring = $(response).find('faultstring');
      
      if($faultstring.length > 0) {
        /* TODO */
      }
      else {
        var $records = $(response).find('Record');
        
        $records.each(function() {
          var $payment = $(this).find('Payment'), 
          paymentAmount = $payment.find('Amount').text(), 
          paymentDate = $payment.find('PaymentDate').text(), 
          $purchaser = $(this).find('Purchaser'), 
          $purchaserName = $purchaser.find('ConsName'), 
          purchaserFirstName = $purchaserName.find('FirstName').text(), 
          purchaserLastName = $purchaserName.find('LastName').text(), 
          purchaserPrimaryEmail = $purchaser.find('PrimaryEmail').text();
          
          addOrder({
            Payment: {
              Amount: paymentAmount, 
              PaymentDate: paymentDate
            }, 
            Purchaser: {
              ConsName: {
                FirstName: purchaserFirstName, 
                LastName: purchaserLastName
              }, 
              PrimaryEmail: purchaserPrimaryEmail
            }
          });
        });
        
        $('.report-table').DataTable({
          'paging': true, /* TODO: only paginate if there are more results than one page */
          'lengthChange': false, 
          'searching': false, 
          'ordering': true, 
          'order': [
            [4, 'desc']
          ], 
          'info': true, 
          'autoWidth': false
        });
        
        $('.content .js--loading-overlay').addClass('hidden');
      }
    }
  });
}]);

dataViewerControllers.controller('LoginFormController', ['$scope', '$location', 'WebServicesService', 'SessionService', function($scope, $location, WebServicesService, SessionService) {
  var requestUrl = WebServicesService.getRequestUrl();
  
  $scope.cwslogin = {};
  
  if(requestUrl) {
    $scope.cwslogin.url = requestUrl;
  }
  
  $scope.submit = function(e) {
    $scope.alerts = [];
    
    $scope.addAlert = function(alert) {
      $scope.alerts.push(alert);
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    };
    
    var goToConstituentsReportView = function() {
      $location.path('/report-constituents');
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    };
    
    /* TODO: validate that web services URL looks kinda right */
    
    /* TODO: disable submit button while loading */
    
    WebServicesService.login({
      url: $('#login-url').val(), 
      username: $('#login-username').val(), 
      password: $('#login-password').val(), 
      error: function(errorThrown) {
        var errorMessage = errorThrown;
        
        /* TODO: default errorMessage */
        
        $scope.addAlert({
          type: 'danger', 
          message: errorMessage
        });
      }, 
      success: function(response) {
        var $faultstring = $(response).find('faultstring');
        
        if($faultstring.length > 0) {
          $scope.addAlert({
            type: 'danger', 
            message: $faultstring.text()
          });
        }
        else {
          goToConstituentsReportView();
        }
      }
    });
  };
}]);

dataViewerControllers.controller('LoginViewController', ['$scope', '$location', 'WebServicesService', function($scope, $location, WebServicesService) {
  /* TODO */
}]);

dataViewerControllers.controller('MainController', ['$scope', '$route', '$location', function($scope, $route, $location) {
  $scope.$route = $route;
  $scope.$location = $location;
  
  $scope.$on('$locationChangeStart', function(event, newLocation) {
    if(newLocation) {
      var newRouteAndParams = newLocation.split('#/')[1];
      if(newRouteAndParams) {
        var newRoute = newRouteAndParams.split('/')[0];
        if(newRoute === 'login') {
          $('body').removeClass('skin-blue sidebar-mini fixed').addClass('login-page');
        }
        else {
          $('body').removeClass('login-page').addClass('skin-blue sidebar-mini fixed');
        }
      }
    }
  });
}]);