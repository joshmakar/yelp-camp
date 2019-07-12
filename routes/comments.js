//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require packages
const express    = require('express');

// Require models
const Campground = require('../models/campground'),
      Comment    = require('../models/comment');

// Create package associations
const router     = express.Router({mergeParams: true});


//////////////////////////////////////////////////
// Route configuration
//////////////////////////////////////////////////

// NEW - Display the 'add new comment' form
router.get('/new', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(error(err));
    } else {
      res.render('comments/new', {campground: campground});
    }
  })
});

// CREATE - Add new comment to DB
router.post('/', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(error(err));
      res.redirect('/campgrounds');
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          console.log(error(err));
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          campground.comments.push(comment);
          campground.save();
          res.redirect(`/campgrounds/${campground._id}`);
        }
      });
    }
  });
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