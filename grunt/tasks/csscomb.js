/* jshint strict:false */

module.exports = {
  options: {
    config: 'grunt/.csscomb.json'
  }, 
  
  "css": {
    files: [
      {
        expand: true, 
        cwd: 'dist/css/', 
        src: [
          'app.css'
        ], 
        dest: 'dist/css/'
      }
    ]
  }
}