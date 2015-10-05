/* jshint strict:false */

module.exports = {
  "css": {
    files: [{
      expand: true, 
      cwd: 'dist/css/', 
      src: [
        'app.css'
      ]
    }]
  }, 
  
  "js": {
    files: [{
      expand: true, 
      cwd: 'dist/js/', 
      src: [
        'app.js'
      ]
    }]
  }, 
  
  "downloads": {
    files: [{
      expand: true, 
      cwd: 'download/', 
      src: [
        '*.zip', 
        'osx32/**/*.*', 
        'osx64/**/*.*', 
        'win32/**/*.*', 
        'win64/**/*.*'
      ]
    }]
  }
}