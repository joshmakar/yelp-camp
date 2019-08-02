//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require dotenv
require('dotenv').config().parsed;

// Require packages
const bodyParser            = require('body-parser'),
      express               = require('express'),
      expressSession        = require('express-session'),
      flash                 = require('connect-flash'),
      methodOverride        = require('method-override'),
      mongoose              = require('mongoose'),
      passport              = require('passport'),
      passportLocal         = require('passport-local');

// Require models
const User                  = require('./models/user');

// Create package associations
const app                   = express();

// Configure express
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));
app.use(expressSession({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error       = req.flash('error');
  res.locals.info        = req.flash('info');
  res.locals.success     = req.flash('success');
  next();
});

// Configure express & routes
app.use(methodOverride('_method'));
const campgroundRoutes = require('./routes/campgrounds'),
      commentRoutes    = require('./routes/comments'),
      indexRoutes      = require('./routes/index');
app.use('/campgrounds/:id/comments', commentRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use(indexRoutes);

// Configure passport
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Connect to DB
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});

/* Populate Database
const seedDB      = require('./seeds.js');
seedDB(['clearOnly']);
//*/


//////////////////////////////////////////////////
// Start listening
//////////////////////////////////////////////////

app.listen(3000, () => {
  console.log('Yelp Camp App Running');
});


//////////////////////////////////////////////////
// Notes
//////////////////////////////////////////////////

/*

REST - The 7 Routes
 Name       Path           HTTP Verb      Purpose
 Index      /things          GET            List all
┌New        /things/new      GET            Show new form
└Create     /things          POST           Create & redirect
 Show       /things:id       GET            Show specific info
┌Edit       /things:id/edit  GET            Show edit form
└Update     /things:id       PUT            Update & redirect
 Destroy    /things:id       DELETE         Delete & redirect

*/