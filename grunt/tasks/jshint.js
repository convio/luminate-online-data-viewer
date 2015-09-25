/* jshint strict:false */

module.exports = {
  options: {
    jshintrc: 'grunt/.jshintrc'
  }, 
  
  "config": {
    files: [{
      src: [
        'package.json', 
        'Gruntfile.js', 
        'grunt/tasks/*.js', 
        'grunt/.csslintrc', 
        'grunt/.jshintrc'
      ]
    }]
  }, 
  
  "js": {
    files: [{
      expand: true, 
      cwd: 'dist/js/', 
      src: [
        'app.js'
      ], 
      dest: 'dist/js/'
    }]
  }
}