// blog helpers

(function(module){
  var path = require('path');
  var cons = require('consolidate');
  var async = require('async');
  var grunt;

  var Blog = {
    extractDate: function(fileName) {
      var foundDate, dateBits;

      var matches = fileName.match(/(\d{4}(?:-?\d{2}){2})/g);

      if(matches.length) {
        dateBits = matches[0].split('-');

        foundDate = new Date(dateBits[0], dateBits[1] - 1, dateBits[2]);
      }
      
      return foundDate;
    },
    cleanFileName: function(fileName) {
      return path.basename(fileName, '.md');
    },
    sortPosts: function(posts) {
      posts.sort(function(a, b) {
        return b.date < a.date ? -1 : b.date > a.date ? 1 : 0;
      });

      return posts;
    },
    generatePage: function(engine, template, data, dest, callback) {
      cons[engine](template, data, function(err, html) {
        if(err) {
          grunt.log.errorlns(err);  
        } else {
          grunt.file.write(dest, html);
        }

        callback();
      });
    },
    generateIndex: function(options, categories, posts, dest, callback) {
      var perPage = options.home.count || 5;
      var totalPages = ~~(posts.length / perPage + 1);

      async.times(totalPages, function(n, done) {
        var page = n + 1;
        var template = options.home.template;
        var selectedPosts = posts.slice(perPage * n, perPage * page);
        var output = '/' + options.home.paginationUrl.replace('XX', page);
        var templateData = {
          posts: selectedPosts,
          categories: Object.keys(categories),
          page: page,
          totalPages: totalPages,
          perPage: perPage,
          isHome: (page === 1)
        };
        
        if(page === 1) {
          output = '/' + 'index.html';
        }

        Blog.generatePage(options.templateEngine, template, templateData, dest + output, done);
      }, function(err) {
        callback();
      });
    },
    generateCategory: function(options, category, posts, dest, callback) {
      var perPage = options.categories.count || 5;
      var totalPages = ~~(posts.length / perPage + 1);

      async.times(totalPages, function(n, done) {
        var page = n + 1;
        var template = options.categories.template;
        var selectedPosts = posts.slice(perPage * n, perPage * page);
        var output = '/' + options.categories.paginationUrl.replace('XX', page);
        var templateData = {
          posts: selectedPosts,
          category: category,
          page: page,
          totalPages: totalPages,
          perPage: perPage,
          isFirstPage: (page === 1)
        };
        
        if(page === 1) {
          output = '/' + category + '.html';
        }

        Blog.generatePage(options.templateEngine, template, templateData, dest + output, done);
      }, function(err) {
        callback();
      });
    },
    generateCategories: function(options, categories, dest, callback) {
      var categoryList = Object.keys(categories);

      async.eachLimit(categoryList, 5, function(category, done) {
        var categoryPosts = categories[category];
        Blog.generateCategory(options, category, categoryPosts, dest, done);
      }, function(err) {
        callback();
      });
    }
  };

  module.exports = function($grunt) {
    grunt = $grunt;

    return Blog;
  };
})(module);