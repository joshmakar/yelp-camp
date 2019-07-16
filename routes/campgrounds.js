//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require packages
const express    = require('express');

// Require models
const Campground = require('../models/campground');

// Require middlware
const middleware = require('../middleware');

// Create package associations
const router     = express.Router();


//////////////////////////////////////////////////
// Route configuration
//////////////////////////////////////////////////

// INDEX - Display all campgrounds
router.get('/', (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(err);
    } else {
      res.render('campgrounds/index', {campgrounds: allCampgrounds});
    }
  });
});

// NEW - Display the 'add new campground' form
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// CREATE - Add new campground to DB
router.post('/', middleware.isLoggedIn, (req, res) => {
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
      return console.log(err);
    }
    res.redirect('/campgrounds');
  });
});

// SHOW - Display campground info
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, foundCampground) => {
    if (err) {
      return console.log(err);
    }
    res.render('campgrounds/show', {campground: foundCampground});
  });
});

// EDIT - Display edit form
router.get('/:id/edit', middleware.isAuthorizedCampground, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground: foundCampground});
  });
});

// UPDATE - Save edits to DB
router.put('/:id', middleware.isAuthorizedCampground, (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
    if (err) {
      console.log(err);
      return res.redirect('/campgrounds');
    }
    res.redirect(`/campgrounds/${req.params.id}`);
  });
});

// DELETE - Delete from DB
router.delete('/:id', middleware.isAuthorizedCampground, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, err => {
    if (err) {
      console.log(err);
      return res.redirect('/campgrounds');
    }
    res.redirect('/campgrounds');
  });
});


//////////////////////////////////////////////////
// Export
//////////////////////////////////////////////////

module.exports = router;