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