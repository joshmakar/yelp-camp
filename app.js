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

// Configure passport
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* Populate Database
const seedDB      = require('./seeds.js');
seedDB();
//*/


//////////////////////////////////////////////////
// Setup routes
//////////////////////////////////////////////////

// Root route
app.get('/', (req, res) => {
  res.render('landing');
});

//------------------------------------------------

// Campgrounds route: INDEX - Display all campgrounds
app.get('/campgrounds', (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(error(err));
    } else {
      res.render('campgrounds/index', {campgrounds: allCampgrounds});
    }
  });
});

// Campgrounds route: NEW - Display the 'add new campground' form
app.get('/campgrounds' + '/new', (req, res) => {
  res.render('campgrounds/new');
});

// Campgrounds route: CREATE - Add new campground to DB
app.post('/campgrounds', (req, res) => {
  const name   = req.body.campground.name,
        image  = req.body.campground.img,
        desc   = req.body.campground.desc;
  const newCampground = {name: name, image: image, description: desc};
  
  // Add new campground to DB
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err) {
      console.log(error(err));
    } else {
      res.redirect('/campgrounds');
    }
  });
});

// Campgrounds route: SHOW - Display campground info
app.get('/campgrounds/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, foundCampground) => {
    if (err) {
      console.log(error(err));
    } else {
      console.log(foundCampground);
      res.render('campgrounds/show', {campground: foundCampground});
    }
  });
});

//------------------------------------------------

// Comments route: NEW - Display the 'add new comment' form
app.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(error(err));
    } else {
      res.render('comments/new', {campground: campground});
    }
  })
});

// Comments route: CREATE - Add new comment to DB
app.post('/campgrounds/:id/comments', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(error(err));
      res.redirect('/campgrounds');
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          console.log(error(err));
        } else {
          campground.comments.push(comment);
          campground.save();
          res.redirect(`/campgrounds/${campground._id}`);
        }
      });
    }
  });
});

//------------------------------------------------

// Sign up route: NEW - Display registration form
app.get('/register', (req, res) => {
  res.render('register');
});

// Sign up route: CREATE - Add new user to DB
app.post('/register', (req, res) => {
  const username = req.body.username,
        password = req.body.password;
  const newUser = new User({username: username});
  User.register(newUser, password, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('register', {err: err});
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('/campgrounds');
    });
  });
});

//------------------------------------------------

// Log in route: Display login form orm
app.get('/login', (req, res) => {
  res.render('login');
});

// Log in route: Login logic
app.post('/login', passport.authenticate('local', 
  {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
  }
));

//------------------------------------------------

// Log out route: Logout
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/campgrounds');
});

//------------------------------------------------

// 404 route
app.get('*', (req, res) => {
  res.send('404');
});


//////////////////////////////////////////////////
// Middleware
//////////////////////////////////////////////////

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.render('login');
}


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