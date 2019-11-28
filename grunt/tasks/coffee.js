/* jshint strict:false */

module.exports = {
  options: {
    join: true
  }, 
  
  "js": {
    files: [
      {
        'dist/js/app.js': [
          'src/coffee/init.coffee', 
          'src/coffee/config/*.coffee', 
          'src/coffee/service/*.coffee', 
          'src/coffee/*.coffee', 
          'src/coffee/**/*.coffee'
        ]
      }
    ]
  }
}