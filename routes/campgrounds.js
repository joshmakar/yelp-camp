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
router.get('/new', (req, res) => {
  res.render('campgrounds/new');
});

// CREATE - Add new campground to DB
router.post('/', (req, res) => {
  const name  = req.body.campground.name,
        image = req.body.campground.img,
        desc  = req.body.campground.desc;
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

// SHOW - Display campground info
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, foundCampground) => {
    if (err) {
      console.log(error(err));
    } else {
      res.render('campgrounds/show', {campground: foundCampground});
    }
  });
});


//////////////////////////////////////////////////
// Export
//////////////////////////////////////////////////

module.exports = router;