/* jshint strict:false */

module.exports = {
  options: {
    appName: '<%= pkg.window.title %>', 
    flavor: 'normal', 
    version: '0.42.2', 
    platforms: [
      'osx64', 
      'win32', 
      'win64'
    ], 
    buildDir: 'download', 
    buildType: function() {
      return '';
    }
    /* TODO winIco: './dist/images/win-icon.ico' */
    /* TODO macIcns: './dist/images/osx-icon.icns' */
  }, 
  
  src: [
    'package.json', 
    'dist/**/*.*'
  ]
}