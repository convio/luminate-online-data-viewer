/* jshint strict:false */

module.exports = {
  options: {
    jshintrc: 'grunt/.jshintrc'
  }, 
  
  "config": {
    files: [
      {
        src: [
          'package.json', 
          'grunt/.csscomb.json', 
          'grunt/.jshintrc', 
          'grunt/tasks/*.js'
        ]
      }
    ]
  }
}