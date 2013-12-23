/*
 * grunt-blog
 * https://github.com/firstandthird/grunt-blog
 */

var fs = require('fs');
var blogHelpers = require('../lib/blog');
var frontMatter = require('yaml-front-matter');
var async = require('async');
var markx = require('markx');
var cons = require('consolidate');

module.exports = function(grunt) {
  grunt.registerMultiTask('blog', 'Static blog thing', function() {
    var done = this.async();
    var options = this.options();
    var dest = this.data.dest;
    var posts = [];

    options.templateEngine = options.templateEngine || 'ejs';

    async.each(this.filesSrc, function(file, asyncDone){
      var fileData = frontMatter.loadFront(file);
      fileData.date = blogHelpers.extractDate(file);
      fileData.cleanFileName = blogHelpers.cleanFileName(file);

      markx({
        input: fileData.__content
      }, function(err, html){
        if(err) {
          grunt.log.errorlns(err);  
        }

        fileData.html = html;

        posts.push(fileData);

        cons[options.templateEngine](options.post.template, fileData, function(err, html) {
          if(err) {
            grunt.log.errorlns(err);  
          } else {
            grunt.file.write(dest + '/post/' + fileData.cleanFileName + '.html', html);
          }

          asyncDone();
        });
      });
    }, function(err){
      if(err) {
        grunt.log.errorlns(err);
        done();
        return;
      }

      console.log('finished');

      done();
    });
  });
};