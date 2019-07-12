//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require packages
const express  = require('express'),
      passport = require('passport');

// Require models
const User     = require('../models/user');

// Create package associations
const router   = express.Router();


//////////////////////////////////////////////////
// Route configuration
//////////////////////////////////////////////////

// Root route
router.get('/', (req, res) => {
  res.render('landing');
});

//------------------------------------------------

// Sign up route: NEW - Display registration form
router.get('/register', (req, res) => {
  res.render('register');
});

// Sign up route: CREATE - Add new user to DB
router.post('/register', (req, res) => {
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
router.get('/login', (req, res) => {
  res.render('login');
});

// Log in route: Login logic
router.post('/login', passport.authenticate('local', 
  {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
  }
));

//------------------------------------------------

// Log out route: Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/campgrounds');
});

//------------------------------------------------

// 404 route
router.get('*', (req, res) => {
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
// Export
//////////////////////////////////////////////////

module.exports = router;