// blog helpers

(function(module){
  var path = require('path');

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
    }
  };

  module.exports = Blog;
})(module);