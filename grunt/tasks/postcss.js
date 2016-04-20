/* jshint strict:false */

module.exports = {
  options: {
    processors: [
      require('autoprefixer')({
        browsers: [
          'last 2 versions'
        ]
      })
    ]
  }, 
  
  "css": {
    files: [{
      expand: true, 
      cwd: 'dist/css/', 
      src: [
        'app.css'
      ], 
      dest: 'dist/css/'
    }]
  }
}