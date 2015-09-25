module.exports = function(grunt) {
  'use strict';
  
  var config = {
    pkg: grunt.file.readJSON('package.json')
  }, 
  
  loadConfig = function(path) {
    var glob = require('glob'), 
    object = {}, 
    key;
    
    glob.sync('*', {
      cwd: path
    }).forEach(function(option) {
      key = option.replace(/\.js$/, '');
      object[key] = require(path + option);
    });
    
    return object;
  }, 
  
  runTargetedTask = function(tasks, taskTarget) {
    if(taskTarget) {
      for(var i = 0; i < tasks.length; i++) {
        if(config[tasks[i]][taskTarget]) {
          tasks[i] += ':' + taskTarget;
        }
      }
    }
    
    grunt.task.run(tasks);
  };
  
  grunt.util._.extend(config, loadConfig('./grunt/tasks/'));
  grunt.initConfig(config);
  
  require('load-grunt-tasks')(grunt);
  
  grunt.registerTask('html-dist', function(taskTarget) {
    runTargetedTask([
      'htmlmin'
    ], taskTarget);
  });
  
  grunt.registerTask('css-dist', function(taskTarget) {
    runTargetedTask([
      'less', 
      'autoprefixer', 
      /* TODO: csscomb */
      'cssmin'
    ], taskTarget);
  });
  grunt.registerTask('css-test', function(taskTarget) {
    runTargetedTask([
      'csslint'
      /* TODO: clean */
    ], taskTarget);
  });
  
  grunt.registerTask('js-dist', function(taskTarget) {
    runTargetedTask([
      'concat', 
      'uglify'
    ], taskTarget);
  });
  grunt.registerTask('js-test', function(taskTarget) {
    runTargetedTask([
      'jshint'
      /* TODO: clean */
    ], taskTarget);
  });
  
  grunt.registerTask('build-downloads', [
    /* TODO: clean */
    'nwjs'
  ]);
  
  grunt.registerTask('compress-downloads', [
    'compress'
    /* TODO: clean */
  ]);
  
  grunt.registerTask('default', [
    'watch'
  ]);
};