//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require packages
const express  = require('express'),
      passport = require('passport');

// Require models
const User     = require('../models/user');

// Require middlware
const middleware = require('../middleware');

// Create package associations
const router   = express.Router();


//////////////////////////////////////////////////
// Route configuration
//////////////////////////////////////////////////

// Testing route
router.get('/test', (err, res) =>{
  res.send('test route');
});

// Root route
router.get('/', (req, res) => {
  res.render('landing', {page: 'landing'});
});

//------------------------------------------------

// Registration route: NEW - Display registration form
router.get('/register', (req, res) => {
  res.render('register', {page: 'register'});
});

// Registration route: CREATE - Add new user to DB
router.post('/register', (req, res) => {
  const password  = req.body.password;
  req.body.user.username = req.body.username;
  req.body.user.isAdmin = req.body.adminCode === process.env.ADMIN_CODE ? true: false;
  const newUser = new User(req.body.user);
  User.register(newUser, password, (err, user) => {
    if (err) {
      console.error(err);
      req.flash('error', err.message);
      return res.redirect('back');
    }
    passport.authenticate('local')(req, res, () => {
      req.flash('success', `Your ${req.body.user.isAdmin ? 'admin' : ''} account has been created, ${user.username}!`)
      res.redirect('/campgrounds');
    });
  });
});

//------------------------------------------------

// Log in route: Display login form orm
router.get('/login', (req, res) => {
  res.render('login', {page: 'login'});
});

// Log in route: Login logic
router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    successRedirect: '/campgrounds',
    successFlash: 'You\'ve successfully logged in!'
  }),
  (req, res) => {}
);

//------------------------------------------------

// Log out route: Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You\'ve successfully been logged out.');
  res.redirect('/campgrounds');
});

//------------------------------------------------

// 404 route
router.get('*', (req, res) => {
  res.send('404');
});


//////////////////////////////////////////////////
// Export
//////////////////////////////////////////////////

module.exports = router;