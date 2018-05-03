const express = require('express')
const app = express();

//Loading third party modules
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan  = require('morgan');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { mongoDBURL } = require('./config/database');

mongoose.connect(mongoDBURL)
  .then((db) => {
    console.log("connected to mongodb...");
  })
  .catch((err) => {
    console.log("failed to connect to database", err);
  });

app.use(express.static(path.join(__dirname, 'public')))

const { select, generateDate, log, paginate } = require('./helpers/handlebars-helpers');

app.engine('handlebars', exphbs({
  defaultLayout: 'home',
  helpers: { select, generateDate, log, paginate}
}));
app.set('view engine', 'handlebars');

app.use(morgan('combined'));
app.use(methodOverride('_method'));
app.use(upload());
app.use(session({
    secret: 'bimobramantyo321',
    resave: true,
    saveUninitialized: true
}));

// Local Variables
app.use(cookieParser('bimobramantyo321'));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

//passport
app.use(passport.initialize());
app.use(passport.session());

//Local variables using middlewares

app.use((req, res, next) => {
  res.locals.user = req.user || null;

  res.locals.error = req.flash('error');
  next();
});


const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories')
const comments = require('./routes/admin/comments');

app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);



app.listen(3000, () => {
  console.log("listening to port 3000");
});
