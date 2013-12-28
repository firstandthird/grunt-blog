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
    var categoryDest = dest + '/categories/';
    var posts = [];
    var categories = {};
    var page = 0;

    options.templateEngine = options.templateEngine || 'ejs';

    async.each(this.filesSrc, function(file, asyncDone){
      // Todo: find fix: frontMatter silently fails if there's a parse error.
      var fileData = frontMatter.loadFront(file);
      var i, c;
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

        if(fileData.categories) {
          for(i = 0, c = fileData.categories.length; i < c; i++) {
            if(!categories[fileData.categories[i]]) {
              categories[fileData.categories[i]] = [];
            }

            categories[fileData.categories[i]].push(fileData);
          }
        }

        blogHelpers.generatePage(options.templateEngine, options.post.template, fileData, dest + fileData.relativeURL, asyncDone);
      });
    }, function(err){
      if(err) {
        grunt.log.errorlns(err);
        done();
        return;
      }

      posts = blogHelpers.sortPosts(posts);

      async.parallelLimit([
        async.apply(blogHelpers.generateIndex, options, categories, posts, dest),
        async.apply(blogHelpers.generateCategories, options, categories, categoryDest)
      ], 5, function(err) {
        done();
      });
    });
  });
};