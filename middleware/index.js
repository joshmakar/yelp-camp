//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require models
const Campground = require('../models/campground'),
      Comment    = require('../models/comment');


//////////////////////////////////////////////////
// Middleware
//////////////////////////////////////////////////

// Create object to hold middleware functions
const middlewareObj = {};

// User Authentication
middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.render('login');
}

// Campground Authorization
middlewareObj.isAuthorizedCampground = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log('User authentication error');
    return res.redirect('back');
  }
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
      return res.redirect('back');
    }
    if (!foundCampground.author.id.equals(req.user._id)) {
      console.log('User authorization error');
      return res.redirect('back');
    }
    next();
  });
}

// Comment Authorization
middlewareObj.isAuthorizedComment = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log('User authentication error');
    return res.redirect('back');
  }
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) {
      console.log(err);
      return res.redirect('back');
    }
    if (!foundComment.author.id.equals(req.user._id)) {
      console.log('User authorization error');
      return res.redirect('back');
    }
    next();
  });
}

// Export middleware
module.exports = middlewareObj;