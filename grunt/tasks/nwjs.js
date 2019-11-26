/* jshint strict:false */

module.exports = {
  options: {
    appName: '<%= pkg.window.title %>', 
    flavor: 'sdk', 
    version: '0.21.5', 
    platforms: [
      'osx64', 
      'win32', 
      'win64'
    ], 
    buildDir: 'downloads', 
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