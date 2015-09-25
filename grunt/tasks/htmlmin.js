/* jshint strict:false */

module.exports = {
  options: {
  	removeComments: true, 
  	collapseWhitespace: true, 
  	collapseBooleanAttributes: true, 
  	removeEmptyAttributes: true, 
  	removeScriptTypeAttributes: true, 
  	removeStyleLinkTypeAttributes: true, 
  	minifyJS: true
  }, 
  
  "html": {
    files: [
      {
        expand: true, 
        cwd: 'src/', 
        src: [
          '**/*.html'
        ], 
        dest: "dist/"
      }
    ]
  }
}