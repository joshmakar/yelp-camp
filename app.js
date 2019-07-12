//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require packages
const bodyParser            = require('body-parser'),
      chalk                 = require('chalk'),
      express               = require('express'),
      expressSession        = require('express-session'),
      mongoose              = require('mongoose'),
      passport              = require('passport'),
      passportLocal         = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose');

// Require models
const Campground            = require('./models/campground'),
      Comment               = require('./models/comment'),
      User                  = require('./models/user');

// Require routes
const campgroundRoutes      = require('./routes/campgrounds'),
      commentRoutes         = require('./routes/comments'),
      indexRoutes           = require('./routes/index');

// Create package associations
const app                   = express(),
      error                 = chalk.bold.red,
      warning               = chalk.keyword('orange');

// Connect to DB
mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });

// Configure express
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));
app.use(expressSession({
  secret: 'Ive got a lovely bunch of coconuts',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.use('/campgrounds/:id/comments', commentRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use(indexRoutes);

// Configure passport
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* Populate Database
const seedDB      = require('./seeds.js');
seedDB();
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