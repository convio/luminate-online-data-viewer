/* jshint strict:false */

module.exports = {
  "osx64": {
    options: {
      archive: 'downloads/osx64.zip'
    }, 
    files: [
      {
        expand: true, 
        cwd: 'downloads/', 
        src: [
          'osx64/**'
        ]
      }
    ]
  }, 
  
  "win32": {
    options: {
      archive: 'downloads/win32.zip'
    }, 
    files: [
      {
        expand: true, 
        cwd: 'downloads/', 
        src: [
          'win32/**'
        ]
      }
    ]
  }, 
  
  "win64": {
    options: {
      archive: 'downloads/win64.zip'
    }, 
    files: [
      {
        expand: true, 
        cwd: 'downloads/', 
        src: [
          'win64/**'
        ]
      }
    ]
  }
}