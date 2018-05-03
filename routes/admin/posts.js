const express = require('express')
const router = express.Router();

const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');

const { isEmpty, uploadDir } = require('../../helpers/upload-helpers');
const { userAuthenticated } = require('../../helpers/authentication');

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

router.all('/*', /* userAuthenticated, */ (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

//GET all post

router.get('/', (req, res) => {
  Post.find({})
  .populate('category')
  .populate('user')
  .then(posts => {
    console.log("this is the posts: ", posts);
    res.render('admin/posts/index', { posts, message: req.flash('message')} );
  })
  .catch(err => {
    res.send(err);
  });
});

//GET user's post
router.get('/my-posts', (req, res) => {
  Post.find({user: req.user.id})
  .populate('category')
  .populate('user')
  .then(posts => {
    console.log("this is the posts: ", posts);
    res.render('admin/posts/index', { posts, message: req.flash('message')} );
  })
  .catch(err => {
    res.send(err);
  });
});

//EDIT a specific post

router.get('/edit/:id', (req, res) => {
  Post.findOne({_id: req.params.id}).then(post => {
    Category.find({}).then(categories => {
      res.render('admin/posts/edit', { post, categories });
    }).catch(err => { res.send(err); });
  }).catch(err => { res.send(err); });
});

router.put('/edit/:id', (req, res) => {
  let filename = req.files.file | "";
  if(!isEmpty(req.files)) {
    const file = req.files.file;
    console.log(file);
    filename = Date.now() + '-' + file.name;
    file.mv('./public/uploads/' + filename, (err) => {
      if(err) throw err;
    });
  }
  const {title, body, status, category } = req.body;
  const allowComments = req.body.allowComments === "on" ? true : false;
  Post.findOneAndUpdate({_id: req.params.id},
    { $set: { title, status, allowComments, body, category, file: filename} } )
    .then((post) => {
      req.flash('message', `Successfully edited post "${post.title}" (#${post._id})`)
      res.redirect('/admin/posts/my-posts');
    })
    .catch(err => {
      res.send(err);
    });
});

//DELETE a specific post

router.delete('/delete/:id', (req, res) => {

  Post.findOne({_id: req.params.id})
    .populate('comments')
    .then(post => {
      fs.unlink(uploadDir + post.file, (err) => {
        if(err) return err;
        if(post.comments.length>0) {
          post.comments.forEach(comment=>{
            comment.remove();
          });
        }
      });
      post.remove()
        .then(() => {
          res.redirect('/admin/posts/my-posts');
        }).catch(err => res.send(err));
    })
    .catch(err => res.send(err));
});


router.delete('/delete/:id', (req, res) => {
  Comment.remove({_id: req.params.id}).then(deletedComment=>{
    res.redirect('/admin/comments');
  });
});


//GENERATE post

router.get('/create', (req, res) => {
  Category.find({}).then(categories => {
    res.render('admin/posts/create', {categories});
  });
});

router.post('/create', (req, res) => {
  let filename = '';
  if(!isEmpty(req.files)) {
    const file = req.files.file;
    console.log(file);
    filename = Date.now() + '-' + file.name;
    file.mv('./public/uploads/' + filename, (err) => {
      if(err) throw err;
    });
  }

  const { title, body, status, category} = req.body
  const errors = [title, body, status];

  if(errors.indexOf(undefined) !== -1) {
    res.redirect('/admin/posts/create');
  }

  const allowComments = req.body.allowComments === "on" ? true : false
  const newPost = new Post({
    user: req.user.id,
    title,
    status,
    allowComments,
    body,
    category,
    file: filename
  });
  newPost
  .save()
  .then(savedPost => {
    console.log(savedPost);
    req.flash('message', 'post is successfully created!');
    res.redirect('/admin/posts');
  })
  .catch((err) => {
    console.log("error", err);
  });
});


module.exports = router;
