// load all the things we need
var mysql    = require("mysql");
// load the database variables
var configDB = require('../config/databaseConfig.js');
// load utilities
var util     = require('./utilities.js');

// SQl queries
var queries  = {
  blogsQuery: "SELECT `title`, `url`, `authorName`, `authorURL`, `preview`, `timestamp` FROM `blogs` LEFT JOIN `authors` ON `blogs`.`authorID` = `authors`.`authorID` WHERE `published` = 1 ORDER BY `timestamp` DESC",
  adminBlogsQuery: "SELECT `title`, `url`, `authorName`, `authorURL`, `preview`, `updated`, `timestamp`, `published` FROM `blogs` LEFT JOIN `authors` ON `blogs`.`authorID` = `authors`.`authorID` ORDER BY `timestamp` DESC",
  blogQuery: "SELECT * FROM `blogs` LEFT JOIN `authors` ON `blogs`.`authorID` = `authors`.`authorID` WHERE `url` = ?",
  configQuery: "SELECT * FROM `config`",
  authorsQuery: "SELECT * FROM `authors`",
  insert: "INSERT INTO ?? SET ?",
  update: "UPDATE ?? SET ? WHERE ?? = ?",
  delete: "DELETE FROM ?? WHERE ?? = ? "
};

module.exports = function() {

  var self = {};

  // MySQL Connection
  var con = mysql.createConnection(configDB);
  con.connect(function(err){
    if(err){
      console.log('Error connecting to Db');
      console.log(err);
      return;
    }
    console.log('Connection established');
  });

  var query = function(options, done) {
    con.query(options, function(err, res, fields){
      if(err) {
        console.log(err);
        done({err: err});
        return;
      }
      done(res);
    });
  }

  self.config = function(done) {
    query(queries['configQuery'],function(res){
      done(res[0]);
    });
  }

  self.authors = function(done) {
    query(queries['authorsQuery'], done);
  }

  self.adminBlogs = function(done) {
    query(queries['adminBlogsQuery'], done);
  }

  self.blogs = function(done) {
    query(queries['blogsQuery'], function(res) {
      for (var i = res.length - 1; i >= 0; i--) {
      res[i]['preview'] = util.htmlspecialchars_decode(res[i]['preview']);
      res[i]['timestamp'] = util.formatDate(res[i]['timestamp'])
      }
      done(res);
    });
  }

  self.blog = function(blog, done) {
    var options = {
      sql: queries['blogQuery'],
      values: blog
    };
    query(options, function(res) {
      if (res.length < 1) {
        done({
          status: 404,
          message: 'Blog not found'
        });
        return;
      }
      res = res[0];
      res['text'] = util.htmlspecialchars_decode(res['text']);
      res['timestamp'] = util.formatDate(res['timestamp'])
      res['updated'] = util.formatDate(res['updated'])
      done(res);
    });
  }

  self.close = function() {
    con.end(function(err) {
      // The connection is terminated gracefully
      // Ensures all previously enqueued queries are still
      // before sending a COM_QUIT packet to the MySQL server.
    });
  }

  self.save = function(data, done) {
    switch (data['method']) {
      case 'author':
        author(data, done);
        break;
      case 'site':
        site(data, done);
        break;
      case 'save':
        save(data, done);
        break;
      case 'delete':
        deleteBlog(data, done);
        break;
      case 'publish':
        publish(data, done);
        break;
    }
  }

  var author = function(data, done) {
    var good = true;

    if (data['authorID']   == null && 
        data['authorName'] != null && 
        data['authorURL']  != null) 
    {
      data['authorName'] = util.sql_text_encode(data['authorName']);
      var options = {
        sql: queries['insert'],
        values: [
          'authors', 
          {
            authorName: data['authorName'],
            authorURL: data['authorURL']
          }
        ]
      };
    } 
    else if (data['authorID']   != null && 
             data['authorName'] != null && 
             data['authorURL'] != null) 
    {
      data['authorName'] = util.sql_text_encode(data['authorName']);
      var options = {
        sql: queries['update'],
        values: [
          'authors', 
          {
            authorName: data['authorName'],
            authorURL: data['authorURL']
          }, 
          'authorID', 
          data['authorID']
        ]
      };
    } 
    else if (data['authorID']     != null && 
             data['deleteAuthor'] == 'true') 
    {
      var options = {
        sql: queries['delete'],
        values: ['authors', 'authorID', data['authorID']]
      };
    } else {
      good = false;
    }

    if (good) {
      query(options, function(res) {
        done({
          status: 200, 
          message: 'Authors Saved'
        });
      });
    } else {
      done({
        status: 400, 
        error: 'MissingRequiredQueryParameter',
        message: 'Something is missing!'
      });
    }
  }

  var site = function(data, done) {
    if (data['title']         == null ||
        data['tagline']       == null ||
        data['blogUrl']       == null ||
        data['twitter']       == null ||
        data['facebook']      == null ||
        data['github']        == null ||
        data['copyrightName'] == null ||
        data['copyrightUrl']  == null ||
        data['copyrightYear'] == null)
    {
      done({
        status: 400, 
        error: 'MissingRequiredQueryParameter',
        message: 'Something is missing!'
      });
      return
    }
    data['blogUrl'] = data['blogUrl'].replace(/http[s]{0,1}\:/g, '').replace(/\/$/, '');
    var options = {
      sql: queries['update'],
      values: [
        'config',
        {
          title: data['title'],
          tagline: data['tagline'],
          blogUrl: data['blogUrl'],
          twitter: data['twitter'],
          facebook: data['facebook'],
          github: data['github'],
          copyrightName: data['copyrightName'],
          copyrightUrl: data['copyrightUrl'],
          copyrightYear: data['copyrightYear']
        },
        'id',
        1
      ]
    };
    query(options, function(res) {
      done({
        status: 200, 
        message: 'Site Settings Saved'
      });
    });
  }

  var save = function(data, done) {
    if (data['title']    == null ||
        data['author']   == null ||
        data['preview']  == null ||
        data['saveAs']   == null ||
        data['oldTitle'] == null ||
        data['text']     == null)
    {
      done({
        status: 400, 
        error: 'MissingRequiredQueryParameter',
        message: 'Something is missing!'
      });
      return
    }

    data['title']   = util.sql_text_encode(data['title']);
    data['preview'] = util.sql_text_encode(data['preview']);
    data['text']    = util.sql_text_encode(data['text']);

    data['saveAs']    = (data['saveAs'] == 'true'); // string to bool
    data['oldTitle']  = util.url_encode(data['oldTitle']);
    data['saveTitle'] = util.url_encode(data['title']);

    // New or Save As
    if (data['oldTitle'] == ''          || 
        data['oldTitle'] == 'undefined' || 
        (
          data['saveAs']         && 
          data['oldTitle'] != '' && 
          data['oldTitle'].localeCompare(data['saveTitle']) != 0)
        ) 
    {
      var options = {
        sql: queries['insert'],
        values: [
          'blogs',
          {
            title: data['title'],
            authorID: data['author'],
            preview: data['preview'],
            url: data['saveTitle'],
            text: data['text']
          }
        ]
      };
      var newURL = data['saveTitle'];
    } else {
      var options = {
        sql: queries['update'],
        values: [
          'blogs',
          {
            title: data['title'],
            authorID: data['author'],
            preview: data['preview'],
            url: data['saveTitle'],
            text: data['text'],
            updated: new Date()
          }, 
          'url',
          data['oldTitle']
        ]
      };
      if (data['oldTitle'].localeCompare(data['saveTitle']) != 0) {
        var newURL = data['saveTitle'];
      } else {
        var newURL = 'false';
      }
    }

    query(options, function(res) {
      done({
        status: 200, 
        message: 'Blog Saved',
        newURL: newURL
      });
    });
  }

  var deleteBlog = function(data, done) {
    if (data['oldTitle'] == null) {
      done({
        status: 400, 
        error: 'MissingRequiredQueryParameter',
        message: 'Something is missing!'
      });
      return
    }
    data['oldTitle'] = util.url_encode(data['oldTitle']);

    var options = {
      sql: queries['delete'],
      values: ['blogs', 'url', data['oldTitle']]
    };
    query(options, function(res) {
      done({
        status: 200, 
        message: 'Blog Deleted'
      });
    });
  }

  var publish = function(data, done) {
    if (data['oldTitle'] == null ||
        data['boolean'] == null) 
    {
      done({
        status: 400, 
        error: 'MissingRequiredQueryParameter',
        message: 'Something is missing!'
      });
      return
    }
    data['oldTitle'] = util.url_encode(data['oldTitle']);

    var options = {
      sql: queries['update'],
      values: [
        'blogs', 
        {
          'published': data['boolean']
        },
        'url',
        data['oldTitle']
      ]
    };
    query(options, function(res) {
      done({
        status: 200, 
        message: 'Blog Published'
      });
    });
  }

  return self;
};