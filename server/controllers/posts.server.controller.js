(function() {
  'use strict';

  var Post = require('../models/post.server.model');
  var fm = require('front-matter');
  var fs = require('fs');
  var service = require('../services/repo.server.service.js');
  var User = require('../models/user.server.model');

  /* Helper function that returns the download URL for a particular file.  This url will ultimately be saved into the url column of the posts table. */
  var downloadUrl = function(file, username, repoName) {
    return "https://raw.githubusercontent.com/" + username + "/" + repoName + "/master/" + file;
  };

  //adds posts to db
  exports.addPostsToDb = function(filesToAdd, username, userId, repoName) {
    //go to URI of each file, add title to db
    filesToAdd.forEach(function(file) {
      // make sure file is in posts and is markdown
      if (file.slice(0, 6) === 'posts/' && file.slice(-3).toLowerCase() === '.md') {
        var url = downloadUrl(file, username, repoName);
        // get the raw file from the the url of the post
        service.getRawGHFile(url)
          .then(function(rawFile) {
            // retreive front-matter metadata
            var metadata = exports.getMetadata(rawFile);
            var postData = {
              title: metadata.title || "Default Title",
              url: url,
              user_id: userId,
              file: file
            };

            /* Add post to the database.  Log an error if there was a problem. */
            Post.add(postData, function(error) {
              if (error) {
                console.error("Error during Post add: ", error);
              }
            });
          })
          .catch(function(error) {
            console.error("Error during add Posts to db: ", error);
          });
      }
    });
  };

  exports.removePostsfromDb = function(filesToRemove, username, repoName) {
    var url;
    filesToRemove.forEach(function(file) {
      url = downloadUrl(filesToRemove[i], username, repoName);
      Post.remove(url, function(error) {
        console.error("Error during post remove: ", error);
      });
    });
  };

  exports.modifyPostsInDb = function(filesToModify, username, repoName) {
    filesToModify.forEach(function(file) {
      service.getRawGHFile(downloadUrl(file, username, repoName))
        .then(function(rawFile) {
          /* Grab meta data from the post's markdown.  Data is the markdown content we retrieved from Github */
          var metadata = exports.getMetadata(data);
          var postData = {
            title: metadata.title,
            url: url,
            updated_at: new Date()
          };

          /* Add post to the database.  Log an error if there was a problem. */
          Post.modify(postData, function(error) {
            if (error) {
              console.error("Error during post modify: ", error);
            }
          });
        })
        .catch(function(error) {
          console.error("Error during modify posts in db: ", error);
        });
    });
  };


  exports.postReceive = function(req, res) {
    console.log("------------Post received----------------");
    res.sendStatus(201);

    /* The data points we're receiving from the Github webhook.  It's possible that one or many of the filename arrays will contain data */
    var username = req.body.repository.owner.name;
    var repoName = req.body.repository.name;
    /* An array of the names of files that were added to user's repo */
    var filesAdded = req.body.head_commit.added;
    /* An array of the names of files that were removed from user's repo */
    var filesRemoved = req.body.head_commit.removed;
    /* An array of the names of files that were modified in a user's repo */
    var filesModified = req.body.head_commit.modified;

    /* Get github userId from username */
    service.getGHUser(username)
      .then(function(user) {
        var githubUserId = JSON.parse(user).id;
        //find user by github userId and add/remove/modify as needed
        User.findByGithubId(githubUserId, function(error, user) {
          if (error) {
            // console.log("ERROR: ", error);
            console.log("ERROR: INVALID GITHUB USER ID IN postReceive");
          } else {
            console.log("user found, adding / removing / modifying files");
            exports.addPostsToDb(filesAdded, username, user.id, repoName);
            exports.removePostsfromDb(filesRemoved, username, repoName);
            exports.modifyPostsInDb(filesModified, username, repoName);
          }
        });
      })
      .catch(function(error) {
        console.error("Error in getGHUser: ", error);
      });
  };

  exports.postInfo = function(req, res) {
    if (req.query.post_id) {
      var postId = req.query.post_id;
      Post.postInfo(postId, function(error, post) {
        if (error) {
          console.log(error);
          res.send(error);
        } else {
          res.json(post);
        }
      });
    } else {
      res.send(error);
    }
  };

  exports.allPostsInfo = function(req, res) {
    Post.getAllPosts(function(error, posts) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        res.json(posts);
      }
    });
  };

  /* Parses metadata from markdown file using the front-matter library. */
  exports.getMetadata = function(file) {
    var data = fm(file);
    return data.attributes;
  };


  /* returns posts based on a query */
  exports.postSearch = function(req, res) {
    var query = req.query.searchQuery;
    var type = req.query.searchType;
    Post.getPostsOnQuery(query, type, function(error, posts) {
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        res.json(posts);
      }
    });
  };



  //for testing of getMetadata:
  // var file = fs.readFileSync(__dirname + '/sample.md', 'utf8');
  // var metaTest = exports.getMetadata(file, 'www.woot.com');
  // try {
  //   console.log("attributes: ", metaTest);
  // } catch (e) {
  //   console.log(e);
  // }
  //end testing

  /* Dummy Data */
  if (process.env.NODE_ENV === 'development') {
    var req = {};
    var res = {
      sendStatus: function() {
        return;
      }
    };
    req.body = {
      repository: {
        name: 'crouton.io',
        owner: {
          name: 'bdstein33'
        }
      },
      head_commit: {
        added: ['posts/js_instantiation_patterns.md'],
        removed: [],
        modified: []
      }
    };
    exports.postReceive(req, res);
  }

})();
