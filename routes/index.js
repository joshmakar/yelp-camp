//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require packages
const async    = require('async'),
      crypto   = require('crypto'),
      express  = require('express'),
      passport = require('passport'),
      sgMail   = require('@sendgrid/mail');

// Require models
const User       = require('../models/user'),
      Campground = require('../models/campground');

// Create package associations
const router   = express.Router();

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//////////////////////////////////////////////////
// Route configuration
//////////////////////////////////////////////////

// Testing route
router.get('/durindoor', (err, res) =>{
  res.send('You\'ve discovered a hidden door, but it seems to be inpenetrable.');
});

//------------------------------------------------

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
      if (err.code === 11000) {
        req.flash('error', 'A user with the given email is already registered');
        return res.redirect('back');
      }
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

// Log in route: Display login form
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

// Forgot password route: Display forgot password form
router.get('/forgot', (req, res) => {
  res.render('forgot');
});

// Forgot password route: Handle forgot password form
router.post('/forgot', (req, res, next) => {
  async.waterfall([
    done => {
      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({email: req.body.email}, (err, user) => {
        if (!user) {
          req.flash('error', `An email will be sent to ${req.body.email} if a user account with the associated email is found.`);
          return res.redirect('/forgot');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(err => {
          done(err, token, user);
        });
      });
    },
    (token, user, done) => {
      const msg = {
        to: user.email,
        from: process.env.ADMIN_EMAIL,
        subject: 'YelpCamp Password Reset Request',
        text: `http://${req.headers.host}/reset/${token}`,
        html: `http://${req.headers.host}/reset/${token}`,
      };
      sgMail.send(msg, err => {
        if (err) {
          console.error(err);
          req.flash('error', 'An error has occured.');
          return res.redirect('/forgot');
        }
        req.flash('success', `An email has been sent to ${user.email} with further instructions.`);
        done(err, 'done');
      });
    }
  ], err => {
    if (err) {
      console.error('ERR:', err);
      return next(err);
    }
    res.redirect('/forgot');
  });
});

// Forgot password route: Display reset password form
router.get('/reset/:token', (req, res) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, (err, user) => {
    if (!user) {
      console.error(err);
      req.flash('error', 'Password reset toke is either invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

// Forgot password route: Update password
router.post('/reset/:token', (req, res) => {
  async.waterfall([
    done => {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, (err, user) => {
        if (err) {
          console.error(err);
          req.flash('error', 'An error has occured.');
          return req.redirect('back');
        }
        if (!user) {
          req.flash('error', 'Password reset toke is either invalid or has expired.');
          return res.redirect('back');
        }
        if (!req.body.password === req.body.confirm) {
          req.flash('error', 'Your confirmation password does not match.');
          return res.redirect('back');
        }
        user.setPassword(req.body.password, err => {
          if (err) {
            console.error(err);
            req.flash('error', 'An error has occured.');
            return req.redirect('back');
          }
          user.resetPasswordToken,
          user.resetPasswordExpires = undefined;
          user.save(err => {
            if (err) {
              console.error(err);
              req.flash('error', 'An error has occured.');
              return req.redirect('back');
            }
            req.logIn(user, err => {
              done(err, user);
            });
          });
        });
      });
    },
    (user, done) => {
      const msg = {
        to: user.email,
        from: process.env.ADMIN_EMAIL,
        subject: 'Your password has been changed',
        text: `The password for the account with the associated email, ${user.email}, has been changed.`,
        html: `The password for the account with the associated email, ${user.email}, has been changed.`,
      };
      sgMail.send(msg, err => {
        if (err) {
          console.error(err);
          req.flash('error', 'An error has occured.');
          return res.redirect('/forgot');
        }
        req.flash('success', 'Your password has been changed.');
        done(err, 'done');
      });
    }
  ], err => {
    if (err) {
      console.error(err);
      req.flash('error', 'An error has occured.');
      return res.redirect('/forgot');
    }
    res.redirect('/campgrounds');
  });
});

//------------------------------------------------

// User profile route: View
router.get('/users/:id', (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if (err) {
      req.flash('error', 'The specified user could not be found.');
      return res.redirect('back');
    }
    Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds) => {
      if (err) {
        req.flash('error', 'There was an error in your request.');
        return res.redirect('back');
      }
      res.render('users/show', {user: foundUser, campgrounds: campgrounds});
    });
  });
});

//------------------------------------------------

// About route
router.get('/about', (req, res) => {
  res.render('about', {page: 'about'});
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