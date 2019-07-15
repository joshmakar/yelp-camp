//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require packages
const express    = require('express');

// Require models
const Campground = require('../models/campground');

// Create package associations
const router     = express.Router();


//////////////////////////////////////////////////
// Route configuration
//////////////////////////////////////////////////

// INDEX - Display all campgrounds
router.get('/', (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(error(err));
    } else {
      res.render('campgrounds/index', {campgrounds: allCampgrounds});
    }
  });
});

// NEW - Display the 'add new campground' form
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// CREATE - Add new campground to DB
router.post('/', isLoggedIn, (req, res) => {
  const name   = req.body.campground.name,
        image  = req.body.campground.img,
        desc   = req.body.campground.desc;
        author = {
          id: req.user._id,
          username: req.user.username
        };
  const newCampground = {name: name, image: image, description: desc, author: author};
  
  // Add new campground to DB
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err) {
      return console.log(error(err));
    }
    res.redirect('/campgrounds');
  });
});

// SHOW - Display campground info
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, foundCampground) => {
    if (err) {
      return console.log(error(err));
    }
    res.render('campgrounds/show', {campground: foundCampground});
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