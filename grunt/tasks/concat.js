/* jshint strict:false */

module.exports = {
  options: {
    separator: '\n\n'
  }, 
  
  "js": {
    src: [
      'src/vendor/AdminLTE/dist/js/app.js', 
      'src/js/concat-before.js', 
      'src/js/config.js', 
      'src/js/directives/*.js', 
      'src/js/services/*.js', 
      'src/js/controllers/*.js', 
      'src/js/concat-after.js'
    ], 
    dest: 'dist/js/app.js'
  }
}