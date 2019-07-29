//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require packages
const express    = require('express');

// Require models
const Campground = require('../models/campground');

// Require middlware
const middleware = require('../middleware');

// Require Node Geocoder
const NodeGeocoder = require('node-geocoder');
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY_PRIVATE,
  formatter: null
};
const geocoder = NodeGeocoder(options);

// Create package associations
const router     = express.Router();


//////////////////////////////////////////////////
// Route configuration
//////////////////////////////////////////////////

// INDEX - Display all campgrounds
router.get('/', (req, res) => {
  if (req.query.search) {
    const searchQuery = new RegExp(escapeRegExp(req.query.search), 'gi');
    Campground.find({name: searchQuery}, (err, foundCampgrounds) => {
      if (err) {
        console.error(err);
        return res.redirect('/campgrounds');
      }
      if (foundCampgrounds < 1) {
        req.flash('info', 'No campgrounds could be found using the search term provided.');
        return res.redirect('/campgrounds');
      }
      res.render('campgrounds/index', {campgrounds: foundCampgrounds, page: 'campgrounds'});
    });
  } else {
    Campground.find({}, (err, allCampgrounds) => {
      if (err) {
        console.log(err);
        res.redirect('/campground');
      } else {
        res.render('campgrounds/index', {campgrounds: allCampgrounds, page: 'campgrounds'});
      }
    });
  }
});

// NEW - Display the 'add new campground' form
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// CREATE - Add new campground to DB
router.post('/', middleware.isLoggedIn, (req, res) => {
  const name    = req.body.campground.name,
        price   = req.body.campground.price,
        image   = req.body.campground.img,
        desc    = req.body.campground.desc,
        address = req.body.campground.address,
        author  = {
          id: req.user._id,
          username: req.user.username
        };
  geocoder.geocode(address, (err, data) => {
    if (err) {
      console.log(err);
      req.flash('error', 'Provided address not found or invalid.');
      return res.redirect('back');
    }
    const location = {
      address: data[0].formattedAddress,
      lat: data[0].latitude,
      long: data[0].longitude
    };
    const newCampground = {
      name: name,
      price: price,
      image: image,
      description: desc,
      location: location,
      author: author
    };
    // Add new campground to DB
    Campground.create(newCampground, (err, newlyCreated) => {
      if (err) {
        return console.log(err);
      }
      res.redirect('/campgrounds');
    });
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
    req.flash('success', 'You\'re campground has been deleted successfully.');
    res.redirect('/campgrounds');
  });
});


//////////////////////////////////////////////////
// Helper Functions
//////////////////////////////////////////////////

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


//////////////////////////////////////////////////
// Export
//////////////////////////////////////////////////

module.exports = router;