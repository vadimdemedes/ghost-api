# ghost-api [![Circle CI](https://circleci.com/gh/vdemedes/ghost-api.svg?style=svg)](https://circleci.com/gh/vdemedes/ghost-api)

Unofficial API client for Ghost blogs


### Installation

```
$ npm install vdemedes/ghost-api --save
```


### Usage

```js
const ghost = require('ghost-api');

let client = ghost('http://myblog.com', 'auth token');


// find posts
client.posts.find({ page: 1 }).then(function (posts) {
  // done
});


// create a new post
client.posts.create({ title: 'Post title', markdown: 'Post content' }).then(function (post) {
  // done
});


// update an existing post
client.posts.update(1, { title: 'New post title' }).then(function (post) {
  // done
});


// delete a post
client.posts.destroy(1).then(function (post) {
  // done
});
```


### API Support

- Posts


### Tests

[![Circle CI](https://circleci.com/gh/vdemedes/ghost-api.svg?style=svg)](https://circleci.com/gh/vdemedes/ghost-api)

```
$ make test
```


### License

MIT © [vdemedes](https://github.com/vdemedes)
