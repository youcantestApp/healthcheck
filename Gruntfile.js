'use strict';

var argv = require('yargs').argv;

module.exports = function(grunt) {
	var period = argv.p || 5;
	// Unified Watch Object
	var globalConfig = {
		period : period
	};

	var watchFiles = {
		js: ['Gruntfile.js', 'src/**/*.js'],
	};

	// Project Configuration
	grunt.initConfig({
		globalConfig: globalConfig,
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			js: {
				files: watchFiles.js,
      	tasks: ['newer:babel'],
				options: {
					reload: true
				}
			},
		},
    babel: {
        dist: {
            files: [{
                expand: true,
                cwd: 'src/',
                src: ['**/*.js'],
                dest: 'dist/'
            }]
        }
    },
    nodemon: {
			dev: {
				script: 'dist/index.js',
				options: {
					nodeArgs: ['--harmony'],
					ext: 'js',
					args:['-p <%= globalConfig.period %>']
				}
			}
		},
		concurrent: {
			default: ['nodemon', 'watch'],
			debug: ['nodemon', 'watch'],
			options: {
				logConcurrentOutput: true,
				limit: 10
			}
		}
  });

  if (grunt.cli.tasks[0] === "newer:babel") {
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-newer');
  }
  else {
    require('load-grunt-tasks')(grunt, {scope: 'dependencies'});
  }

  grunt.option('force',true);

  grunt.registerTask('build', ['newer:babel']);
  grunt.registerTask('run', ['concurrent:default']);

  grunt.registerTask('default', ['build', 'run']);

};
