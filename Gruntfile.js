/**
 * Schedule AngularJS Module
 * https://github.com/albulescu/angular-ca-schedule
 *
 * Author Albulescu Cosmin <cosmin@albulescu.ro>
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    require('jit-grunt')(grunt, {
        usebanner : 'grunt-banner',
        ngtemplates: 'grunt-angular-templates',
    });

    var banner = '/**\n'+
                 '* Schedule AngularJS Module v<%= pkg.version %>\n'+
                 '* https://github.com/albulescu/angular-ca-schedule\n'+
                 '*\n'+
                 '* Author Albulescu Cosmin <cosmin@albulescu.ro>\n'+
                 '* Licensed under the MIT license.\n'+
                 '*/\n';

    grunt.initConfig({

        pkg: grunt.file.readJSON('bower.json'),

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            source: [
                './src/**/*.js'
            ],
        },


        // Empties folders to start fresh
        clean: {
            tmp: '.tmp'
        },

        // Compiles Less to CSS
        less: {
          options: {
            paths: [
              'src/styles'
            ]
          },
          server: {
            files: {
              'ca-schedule.css' : 'src/styles/schedule.less'
            }
          },
        },


        // Package all the html partials into a single javascript payload
        ngtemplates: {
          options: {
            // This should be the name of your apps angular module
            module: 'ca.schedule.templates',
            standalone: true,
            prefix: 'ca-schedule/directive/',
            htmlmin: {
              collapseBooleanAttributes: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true,
              removeEmptyAttributes: false,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true
            }
          },
          main: {
            cwd: 'src/templates',
            src: '**.html',
            dest: '.tmp/templates.js'
          },
        },

        concat: {
            options: {
                separator:'\n\n',
                stripBanners: true,
                banner: banner + '\n\'use strict\';\n\n',
                process: function(src, filepath) {
                    return src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                },
            },
            dist: {
                src: ['.tmp/templates.js','src/**/*.js'],
                dest: 'ca-schedule.js',
            },
        },

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    src: 'ca-schedule.js'
                }]
            }
        },

        uglify: {
            source: {
                files: {
                    'ca-schedule.min.js': ['ca-schedule.js']
                }
            }
        },

        usebanner: {
            comments: {
                options: {
                    position: 'top',
                    banner: banner,
                },
                files: {
                    src: ['ca-schedule.min.js']
                }
            }
        },

        watch: {
            source: {
                files: ['src/**/*.js'],
                tasks: ['build']
            },
            less: {
                files: ['src/styles/**/*.less'],
                tasks: ['less']
            }
        }

    });

    grunt.registerTask('build', [
        'clean:tmp',
        'ngtemplates',
        'concat',
        'ngAnnotate',
        'uglify',
        'less',
        'usebanner',
    ]);

    grunt.registerTask('start', [
        'build',
        'watch',
    ]);

    grunt.registerTask('default', [
        'jshint:source',
        'build',
    ]);
};