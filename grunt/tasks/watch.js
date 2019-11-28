/* jshint strict:false */

module.exports = {
  "config": {
    files: [
      'package.json', 
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
      'src/*.html', 
      'src/**/*.html'
    ], 
    tasks: [
      'html-dist:html'
    ]
  }, 
  
  "css": {
    files: [
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
      'src/coffee/*.coffee', 
      'src/coffee/**/*.coffee'
    ], 
    tasks: [
      'js-dist:js', 
      'js-clean:js'
    ]
  }
}