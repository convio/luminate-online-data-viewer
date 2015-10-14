/* jshint strict:false */

module.exports = {
  options: {
    appName: 'Luminate Online Data Viewer', 
    version: '0.12.3', 
    platforms: [
      'win', 
      'osx'
    ], 
    buildDir: './download', 
    buildType: function() {
      return '';
    }
    /* TODO macIcns: './dist/images/osx-icon.icns' */
  }, 
  
  src: [
    './package.json', 
    './dist/**/*.*'
  ]
}