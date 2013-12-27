/*
 * grunt-blog
 * https://github.com/firstandthird/grunt-blog
 */

module.exports = function(grunt) {
  var fs = require('fs');
  var blogHelpers = require('../lib/blog')(grunt);
  var frontMatter = require('yaml-front-matter');
  var async = require('async');
  var markx = require('markx');

  grunt.registerMultiTask('blog', 'Static blog thing', function() {
    var done = this.async();
    var options = this.options();
    var dest = this.data.dest;
    var posts = [];
    var page = 0;

    options.templateEngine = options.templateEngine || 'ejs';

    async.each(this.filesSrc, function(file, asyncDone){
      // Todo: find fix: frontMatter silently fails if there's a parse error.
      var fileData = frontMatter.loadFront(file);
      fileData.date = blogHelpers.extractDate(file);
      fileData.cleanFileName = blogHelpers.cleanFileName(file);
      fileData.relativeURL = 'post/' + fileData.cleanFileName + '.html';

      // Post page
      markx({
        input: fileData.__content
      }, function(err, html){
        if(err) {
          grunt.log.errorlns(err);  
        }

        fileData.html = html;

        posts.push(fileData);

        blogHelpers.generatePage(options.templateEngine, options.post.template, fileData, dest + fileData.relativeURL, asyncDone);
      });
    }, function(err){
      if(err) {
        grunt.log.errorlns(err);
        done();
        return;
      }

      posts = blogHelpers.sortPosts(posts);

      // Index page & Pagination
      blogHelpers.generateIndex(options, posts, dest, done);
    });
  });
};