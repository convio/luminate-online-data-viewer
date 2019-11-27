module.exports = (grunt) ->
  'use strict'
  
  config =
    pkg: grunt.file.readJSON('package.json')
  loadConfig = (path) ->
    glob = require 'glob'
    object = {}
    glob.sync '*',
      cwd: path
    .forEach (option) ->
      key = option.replace /\.js$/, ''
      object[key] = require path + option
      return
    object
  grunt.util._.extend config, loadConfig('./grunt/tasks/')
  grunt.initConfig config
  require('load-grunt-tasks') grunt
  
  runTargetedTask = (tasks, taskTarget) ->
    if taskTarget
      i = 0
      while i < tasks.length
        if config[tasks[i]][taskTarget]
          tasks[i] += ':' + taskTarget
        i++
    grunt.task.run tasks
    return
  
  grunt.registerTask 'html-dist', (taskTarget) ->
    runTargetedTask [
      'htmlmin'
    ], taskTarget
  grunt.registerTask 'css-dist', (taskTarget) ->
    runTargetedTask [
      'less'
      'postcss'
      # TODO: csscomb
      'cssmin'
    ], taskTarget
  grunt.registerTask 'css-test', (taskTarget) ->
    runTargetedTask [
      'csslint'
    ], taskTarget
  grunt.registerTask 'css-clean', (taskTarget) ->
    runTargetedTask [
      'clean'
    ], taskTarget
  grunt.registerTask 'js-dist', (taskTarget) ->
    runTargetedTask [
      'concat'
      'uglify'
    ], taskTarget
  grunt.registerTask 'js-test', (taskTarget) ->
    runTargetedTask [
      'jshint'
    ], taskTarget
  grunt.registerTask 'js-clean', (taskTarget) ->
    runTargetedTask [
      'clean'
    ], taskTarget
  grunt.registerTask 'build-downloads', [
    'clean:downloads'
    'nwjs'
    'compress'
  ]
  grunt.registerTask 'default', [
    'watch'
  ]
  return