'use strict';

/**
 * Dependencies
 */

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

function Client (endpoint, token) {
  if (!(this instanceof Client)) return new Client(endpoint, token);

  this.endpoint = endpoint + '/ghost/api/v0.1';
  this.token = token;
  this.defaultOptions = {
    headers: {
      'authorization': 'Bearer ' + token,
      'content-type': 'application/json'
    }
  };

  bindAll(this, ['posts']);
}


/**
 * Overwrite default options and return a new object
 */

Client.prototype.options = function (options) {
  return assign({}, this.defaultOptions, options);
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
  var url = this.endpoint + '/posts';

  query = assign({}, {
    include: 'tags',
    status: 'all',
    page: 1
  }, query);

  var options = this.options({
    qs: query,
    json: true
  });

  return got(url, options).then(function (res) {
    return res.body.posts;
  });
};

/**
 * Find all posts
 *
 * @todo
 */

Client.prototype.posts.all = function () {
  // TODO
};


/**
 * Find one post
 *
 * @param {Number} id
 * @return {Object}
 */

Client.prototype.posts.findOne = function (id) {
  var url = this.endpoint + '/posts/' + id;

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
