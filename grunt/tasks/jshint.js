/* jshint strict:false */

module.exports = {
  options: {
    jshintrc: 'grunt/.jshintrc'
  }, 
  
  "config": {
    files: [{
      src: [
        'package.json', 
        'grunt/tasks/*.js', 
        'grunt/.csslintrc', 
        'grunt/.jshintrc'
      ]
    }]
  }
}