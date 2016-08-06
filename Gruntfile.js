var grunt = require('grunt');

grunt.loadNpmTasks('grunt-contrib-jshint');
//grunt.loadNpmTasks('grunt-mocha-test');
grunt.loadNpmTasks('grunt-js-beautify');
grunt.initConfig({
  jshint: {
    all: ['src/**/*.js', '!src/lib/**/*.js', 'Gruntfile.js']
  },
  js_beautify: {
    options: {
      "end_with_newline": true,
      "indent_size": 2,
      "indent_char": " ",
      "eol": "\n",
      "indent_with_tabs": false,
      "preserve_newlines": true,
      "max_preserve_newlines": 10,
      "jslint_happy": false,
    },
    files: ['src/**/*.js', '~src/lib/**/*.js', 'Gruntfile.js']
  },
  mochaTest: {
    test: {
      options: {
        reporter: 'spec',
        //captureFile: 'results.txt', // Optionally capture the reporter output to a file
        quiet: false, // Optionally suppress output to standard out (defaults to false)
        clearRequireCache: true // Optionally clear the require cache before running tests (defaults to false)
      },
      src: ['tests/**/*.js']
    }
  }
});

//grunt.registerTask('default', ['jshint', 'mochaTest', 'js_beautify:files:all']);
grunt.registerTask('default', ['jshint', 'js_beautify:files:all']);
//grunt.registerTask('test', ['mochaTest']);
