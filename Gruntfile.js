module.exports = function(grunt) {
  require('load-grunt-config')(grunt, {
  });

  grunt.loadTasks('tasks');

  grunt.registerTask('scripts', ['jshint', 'notify:generic']);
  grunt.registerTask('default', ['scripts', 'blog']);
  grunt.registerTask('dev', ['default', 'connect:server', 'notify:watch', 'watch']);
};