'use strict';

/**
 * Dependencies
 */

var stringify = require('querystring').stringify;
var Promise = require('pinkie-promise');
var assign = require('object-assign');
var got = require('got');

var json = JSON.stringify;


/**
 * Expose `ghost-api`
 */

module.exports = Client;


/**
 * Unofficial API client for Ghost blogs
 */

function Client (endpoint) {
  if (!(this instanceof Client)) return new Client(endpoint);

  this.endpoint = endpoint + '/ghost/api/v0.1';

  bindAll(this, ['posts']);
}


/**
 * Overwrite default options and return a new object
 */

Client.prototype.options = function (options) {
  var defaults = {
    headers: {
      'authorization': 'Bearer ' + this.token,
      'content-type': 'application/json'
    }
  };

  return assign({}, defaults, options);
};


/**
 * Authorize via OAuth
 */

Client.prototype.authorize = function (email, password) {
  var url = this.endpoint + '/authentication/token';

  var self = this;

  return req(url, {
    method: 'post',
    body: {
      username: email,
      password: password,
      grant_type: 'password',
      client_id: 'ghost-admin',
      client_secret: '6e5816927c41'
    }
  }).then(function (res) {
    self.token = JSON.parse(res.body).access_token;

    return self.token;
  });
};


/**
 * Posts API
 */

Client.prototype.posts = {};


/**
 * Find posts with pagination
 *
 * @param {Object} query
 * @return {Array}
 */

Client.prototype.posts.find = function (query) {
  query = assign({}, {
    include: 'tags',
    status: 'all',
    page: 1
  }, query);

  var url = this.endpoint + '/posts/?' + stringify(query);

  var options = this.options({
    json: true
  });

  return got(url, options).then(function (res) {
    return res.body.posts;
  });
};

/**
 * Find all posts
 *
 * @return {Array}
 */

Client.prototype.posts.all = function () {
  return this.posts.find({ limit: 'all', status: 'all' });
};


/**
 * Find one post
 *
 * @param {Number} id
 * @return {Object}
 */

Client.prototype.posts.findOne = function (id, query) {
  var url;

  if (typeof id === 'string') {
    url = this.endpoint + '/posts/slug/' + id + '/?';
  } else {
    url = this.endpoint + '/posts/' + id + '/?';
  }

  query = assign({
    status: 'all',
    include: 'tags'
  }, query);

  url += stringify(query);

  var options = this.options({
    json: true
  });

  return got(url, options).then(function (res) {
    return res.body.posts[0];
  });
};


/**
 * Create a new post
 *
 * @param {Object} data
 * @return {Object}
 */

Client.prototype.posts.create = function (data) {
  if (!data) {
    data = {};
  }

  if (!data.title) {
    var err = new Error('Post requires a `title` property');

    return Promise.reject(err);
  }

  var url = this.endpoint + '/posts';

  var options = this.options({
    method: 'post',
    body: json({
      posts: [data]
    })
  });

  return req(url, options).then(function (res) {
    return JSON.parse(res.body).posts[0];
  });
};


/**
 * Update an existing post
 *
 * @param {Number} id
 * @param {Object} data
 * @return {Object}
 */

Client.prototype.posts.update = function (id, data) {
  var url = this.endpoint + '/posts/' + id;

  var options = this.options({
    method: 'put',
    body: json({
      posts: [data]
    })
  });

  return req(url, options).then(function (res) {
    return JSON.parse(res.body).posts[0];
  });
};


/**
 * Delete a post
 *
 * @param {Number} id
 * @return {Object}
 */

Client.prototype.posts.destroy = function (id) {
  var url = this.endpoint + '/posts/' + id;

  var options = this.options({
    method: 'delete'
  });

  return req(url, options).then(function (res) {
    return JSON.parse(res.body).posts[0];
  });
};


/**
 * Helpers
 */


/**
 * Wrapper around got to follow redirect on POST/PUT/DELETE requests
 */

function req (url, options) {
  return got(url, options).catch(function (err) {
    var isRedirect = err instanceof got.HTTPError && err.statusCode === 302;

    if (!isRedirect) {
      return Promise.reject(err);
    }

    url = err.response.headers.location;

    return got(url, options);
  });
}


/**
 * Bind all object methods to a context
 */

function bindAll (obj, props) {
  props.forEach(function (prop) {
    var keys = Object.keys(obj[prop]);

    keys.forEach(function (key) {
      obj[prop][key] = obj[prop][key].bind(obj);
    });
  });
}
