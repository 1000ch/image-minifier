module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      csslib: {
        src: [
          'bower_components/normalize.css/normalize.css',
          'bower_components/font-awesome/css/font-awesome.css'
        ],
        dest: 'build/css/lib.css'
      },
      cssapp: {
        src: ['index.css'],
        dest: 'build/css/app.css'
      },
      jslib: {
        src: [
          'bower_components/underscore/underscore.js',
          'bower_components/mustache/mustache.js'
        ],
        dest: 'build/js/lib.js'
      },
      jsapp: {
        src: ['index.js'],
        dest: 'build/js/app.js'
      }
    },
    uglify: {
      jslib: {
        options: {
          preserveComments: 'some'
        },
        files: {
          'build/js/lib.min.js': ['build/js/lib.js']
        }
      },
      jsapp: {
        files: {
          'build/js/app.min.js': ['build/js/app.js']
        }
      }
    },
    csso: {
      csslib: {
        files: {
          'build/css/lib.min.css': ['build/css/lib.css']
        }
      },
      cssapp: {
        files: {
          'build/css/app.min.css': ['build/css/app.css']
        }
      }
    },
    clean: {
      build: {
        src: ["build"]
      }
    },
    copy: {
      img: {
        files: [{
          expand: true,
          flatten: true,
          src: 'bower_components/loading/*.svg',
          dest: 'build/img/loading'
        }]
      },
      font: {
        files: [{
          expand: true,
          flatten: true,
          src: 'bower_components/font-awesome/fonts/*',
          dest: 'build/fonts'
        }]
      }
    },
    watch: {
      cssapp: {
        files: ['src/css/*.css'],
        tasks: ['build:css:app']
      },
      jsapp: {
        files: ['src/js/*.js'],
        tasks: ['build:js:app']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-csso');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build:font', 'copy:font');
  grunt.registerTask('build:css:lib', ['concat:csslib', 'csso:csslib']);
  grunt.registerTask('build:css:app', ['concat:cssapp', 'csso:cssapp']);
  grunt.registerTask('build:css', ['build:css:lib', 'build:css:app']);
  grunt.registerTask('build:js:lib', ['concat:jslib', 'uglify:jslib']);
  grunt.registerTask('build:js:app', ['concat:jsapp', 'uglify:jsapp']);
  grunt.registerTask('build:js', ['build:js:lib', 'build:js:app']);
  grunt.registerTask('build', ['clean:build', 'build:font', 'build:css', 'build:js']);
  grunt.registerTask('default', ['watch']);
};