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

        cons[options.templateEngine](options.post.template, fileData, function(err, html) {
          if(err) {
            grunt.log.errorlns(err);  
          } else {
            grunt.file.write(dest + fileData.relativeURL, html);
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

      posts = blogHelpers.sortPosts(posts);

      // Index page & Pagination
      var perPage = options.home.count || 5;
      var totalPages = ~~(posts.length / perPage + 1);

      async.times(totalPages, function(n, callback) {
        var page = n + 1;
        var template = options.home.template;
        var selectedPosts = posts.slice(perPage * n, perPage * page);
        var output = '/' + options.home.paginationUrl.replace('XX', page);
        var templateData = {
          posts: selectedPosts,
          page: page,
          totalPages: totalPages,
          perPage: perPage,
          isHome: (page === 1)
        };
        
        if(page === 1) {
          output = '/' + 'index.html';
        }

        cons[options.templateEngine](template, templateData, function(err, html) {
          if(err) {
            grunt.log.errorlns(err);  
          } else {
            grunt.file.write(dest + output, html);
          }

          callback();
        });
      }, function(err) {
        done();
      });
    });
  });
};