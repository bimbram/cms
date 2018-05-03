const express = require('express')
const router = express.Router();
const Comment = require('../../models/Comment');
const Post = require('../../models/Post');
const { userAuthenticated } = require('../../helpers/authentication');

router.all('/*', /* userAuthenticated, */  (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});


//remember to authenticate the user before comment!

router.get('/', (req, res) => {
  Comment.find({user: req.user.id}).populate('user').then(comments=>{
    console.log(comments);
    res.render('admin/comments', {comments} );
  });
});

router.post('/', (req, res) => {
  const {postid, body} = req.body
  console.log("postid:", postid);
  Post.findOne({_id: postid}).then(post=>{
    const newComment = new Comment({
      user: req.user.id,
      body
    });

    post.comments.push(newComment);
    post.save().then(savedPost=>{
      newComment.save().then(savedComment=>{
        req.flash('success_message', 'Your comment will be reviewed');
        res.redirect(`/post/${post.id}`);
      });
    });
  });
});

router.delete('/delete/:id', (req, res) => {
  Comment.remove({_id: req.params.id}).then(deletedComment=>{
    Post.findOneAndUpdate({comments: req.params.id}, {
      $pull: {comments: req.params.id}
    }, (err, data) => {
      if(err) return err;
      res.redirect('/admin/comments');
    });
  });
});

//Approve Comment
router.post('/approve-comment', (req, res) => {
  Comment.findByIdAndUpdate(req.body.id, {$set: {approvedComment: req.body.approvedComment}}, (err, result) => {
    if(err) return err;
    res.send(result);
  });
});



module.exports = router;
