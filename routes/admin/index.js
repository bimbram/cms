const express = require('express')
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');

const faker = require('faker');
const { userAuthenticated } = require('../../helpers/authentication');

router.all('/*', /* userAuthenticated, */ (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.get('/', (req, res) => {
  const promises = [
      Post.count().exec(),
      Category.count().exec(),
      Comment.count().exec()
  ];

  Promise.all(promises).then(([postCount, categoryCount, commentCount]) => {
      res.render('admin/index', { postCount, categoryCount, commentCount });
  });

  // Post.count().then(postCount=> {
  //   res.render('admin/index', { postCount });
  // });
});

router.post('/generate-fake-posts', (req, res) => {
  for(let i=0; i < req.body.amount; i++) {
    let post = new Post({
      user: req.user.id,
      title: faker.name.title(),
      status: 'public',
      allowComments: faker.random.boolean(),
      slug: faker.name.title(),
      body: faker.lorem.sentence()
    });
    post.save()
      .then(savedPost => {
      res.redirect('/admin/posts');
    }).catch((err) => res.render(err));
  }
})

module.exports = router;
