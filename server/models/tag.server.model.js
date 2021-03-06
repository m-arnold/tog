(function(){
  'use strict';
  var db = require('../config/db');
  var Tag = require('../config/schema').Tag;

  Tag.getAll = function(callback) {
    db.knex.raw(' SELECT title AS tag_title FROM tags')
    .then(function(data, error) {
      console.log(data[0]);
      callback(error, data[0]);
    });
  };

  Tag.createOrSave = function(tagTitle, callback) {
    new Tag({'title': tagTitle})
    .fetch()
    .then(function(tag) {
      if (!tag) {
        new Tag({'title': tagTitle})
        .save()
        .then(function(tag) {
          callback(null, tag);
        });
      } else {
        callback("Already exists");
      }
    });
  };

  module.exports = Tag;
})();



