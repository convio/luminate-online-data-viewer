/* jshint strict:false */

module.exports = {
  "osx32": {
    options: {
      archive: 'download/osx32.zip'
    }, 
    files: [
      {
        expand: true, 
        cwd: 'download/', 
        src: [
          'osx32/**'
        ]
      }
    ]
  }, 
  
  "osx64": {
    options: {
      archive: 'download/osx64.zip'
    }, 
    files: [
      {
        expand: true, 
        cwd: 'download/', 
        src: [
          'osx64/**'
        ]
      }
    ]
  }, 
  
  "win32": {
    options: {
      archive: 'download/win32.zip'
    }, 
    files: [
      {
        expand: true, 
        cwd: 'download/', 
        src: [
          'win32/**'
        ]
      }
    ]
  }, 
  
  "win64": {
    options: {
      archive: 'download/win64.zip'
    }, 
    files: [
      {
        expand: true, 
        cwd: 'download/', 
        src: [
          'win64/**'
        ]
      }
    ]
  }
}