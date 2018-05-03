const express = require('express')
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


router.all('/*', (req, res, next) => {
  req.app.locals.layout = "home";
  next();
});

//APP fetch posts

router.get('/', (req, res) => {
  const perPage = 10;
  const page = req.query.page || 1;
  Post.find({}).populate({path: 'user'})
  .skip((perPage * page) - perPage)
  .limit(perPage)
  .then(posts => {
    Post.count().then(postCount=>{
      Category.find({}).then(categories => {
        res.render('home/index', {
          posts,
          categories,
          current: parseInt(page),
          pages: Math.ceil(postCount / perPage)
        });
      });
    });
  });
});

//APP fetch single post

router.get('/post/:slug', (req, res) => {
  Post.findOne({slug: req.params.slug})
  .populate('user')
  .populate({path: 'comments', match: {approvedComment: true}, populate: {path: 'user', model: 'users'}})
  .then(post => {
    Category.find({}).then(categories => {
      console.log("this is the post", post);
      res.render(`home/post`, {post, categories, success_message: req.flash("success_message") });
    });
  });
})

router.get('/about', (req, res) => {
  res.render('home/about');
});

//APP Login

router.get('/login', (req, res) => {
  res.render('home/login', {
    success_message: req.flash('success_message'),
    error_message: req.flash('error_message')
  });
});

passport.use(new LocalStrategy({
  usernameField: "email"
}, (email, password, done) => {
  User.findOne({email}).then(matchedUser => {
    if(!matchedUser) {
      return done(null, false, {message: "no user found"});
    }
    bcrypt.compare(password, matchedUser.password, (err, matched) => {
      if(err) return err;
      if(matched) {
        return done(null, matchedUser)
      } else {
        return done(null, false, {message: "incorrect password"});
      }
    });
  }).catch(err => {
    return done(err);
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

//APP Logout

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

//APP Register

router.get('/register', (req, res) => {
  res.render('home/register');
});

router.post('/register', (req, res) => {
  const {firstName, lastName, email, password, passwordConfirm } = req.body;

  let errors = [];

  if(!firstName) {
    errors.push({message: 'please add your first name'});
  }

  if(!lastName) {
    errors.push({message: 'please add your last name'});
  }

  if(!email) {
    errors.push({message: 'please add your email'});
  }

  if(!password && passwordConfirm) {
    errors.push({message: 'please input your password'});
  }

  if(password !== passwordConfirm) {
    errors.push({message: "password unmatch"})
  }

  if(errors.length > 0) {
    res.render('home/register', {
      errors,
      firstName,
      lastName,
      email
    });
  } else {
      User.findOne({email}).then(matchedUser => {
        if(!matchedUser) {
          const newUser = new User({
            firstName, lastName, email, password
          });
          bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                newUser.password = hash;
                newUser.save().then(savedUser => {
                  req.flash('success_message', 'You are now registered, please login')
                  res.redirect('/login');
                });
              });
          });
        } else {
            req.flash('error_message', "email already exists, please login")
            res.redirect('/login');
        }
      });
  }
});


module.exports = router;
