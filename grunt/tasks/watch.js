/* jshint strict:false */

module.exports = {
  "config": {
    files: [
      'package.json', 
      'Gruntfile.js', 
      'grunt/tasks/*.js', 
      'grunt/.csslintrc', 
      'grunt/.jshintrc'
    ], 
    tasks: [
      'jshint:config'
    ]
  }, 
  
  "html": {
    files: [
      'src/**/*.html'
    ], 
    tasks: [
      'html-dist:html'
    ]
  }, 
  
  "css": {
    files: [
      'src/vendor/AdminLTE/build/**/*.*', 
      'src/bootstrap/less/*.less', 
      'src/less/*.less'
    ], 
    tasks: [
      'css-dist:css', 
      'css-test:css', 
      'css-clean:css'
    ]
  }, 
  
  "js": {
    files: [
      'src/js/**/*.js'
    ], 
    tasks: [
      'js-dist:js', 
      'js-test:js', 
      'js-clean:js'
    ]
  }
}