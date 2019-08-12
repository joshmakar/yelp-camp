//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require packages
const async = require('async'),
  express = require('express'),
  multer = require('multer'),
  cloudinary = require('cloudinary').v2;

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
const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//////////////////////////////////////////////////
// Route configuration
//////////////////////////////////////////////////

// INDEX - Display all campgrounds
router.get('/', (req, res) => {
  if (req.query.search) {
    const searchQuery = new RegExp(escapeRegExp(req.query.search), 'gi');
    Campground.find({ name: searchQuery }, (err, foundCampgrounds) => {
      if (err) {
        console.error(err);
        return res.redirect('/campgrounds');
      }
      if (foundCampgrounds < 1) {
        req.flash('info', 'No campgrounds could be found using the search term provided.');
        return res.redirect('/campgrounds');
      }
      res.render('campgrounds/index', { campgrounds: foundCampgrounds, page: 'campgrounds' });
    });
  } else {
    Campground.find({}, (err, allCampgrounds) => {
      if (err) {
        console.error(err);
        res.redirect('/campground');
      } else {
        res.render('campgrounds/index', { campgrounds: allCampgrounds, page: 'campgrounds' });
      }
    });
  }
});

// NEW - Display the 'add new campground' form
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// CREATE - Add new campground to DB
router.post('/', middleware.isLoggedIn, upload.single('image'), (req, res) => {
  const name = req.body.campground.name,
    price = req.body.campground.price,
    desc = req.body.campground.desc,
    address = req.body.campground.address,
    author = {
      id: req.user._id,
      username: req.user.username
    };
  geocoder.geocode(address, (err, data) => {
    if (err) {
      console.error(err);
      return res.redirect('back');
    }
    if (!data || !data.length) {
      req.flash('error', 'Provided address not found or invalid.');
      return res.redirect('back');
    }
    cloudinary.uploader.upload(req.file.path, (error, result) => {
      if (error) {
        console.error(error);
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
        image: result.secure_url,
        description: desc,
        location: location,
        author: author
      };
      // Add new campground to DB
      Campground.create(newCampground, (err, newlyCreated) => {
        if (err) {
          return console.error(err);
        }
        res.redirect(`/campgrounds/${newlyCreated.id}`);
      });
    });
  });
});

// SHOW - Display campground info
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, foundCampground) => {
    if (err) {
      return console.error(err);
    }
    res.render('campgrounds/show', { campground: foundCampground });
  });
});

// EDIT - Display edit form
router.get('/:id/edit', middleware.isAuthorizedCampground, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.error(err);
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground: foundCampground });
  });
});

// UPDATE - Save edits to DB
router.put('/:id', middleware.isAuthorizedCampground, upload.single('image'), (req, res) => {
  async.waterfall([
    function shouldLocationUpdate(done) {
      Campground.findById(req.params.id, (err, currentCampground) => {
        if (err) {
          done(err);
          return;
        }
        let updateLocation = req.body.campground.address === currentCampground.location.address ? false : true;
        done(null, updateLocation);
      });
    },
    function updateLocation(updateLocation, done) {
      if (updateLocation) {
        geocoder.geocode(req.body.campground.address, (err, locationData) => {
          if (err) {
            done(err);
            return;
          }
          if (!locationData || !locationData.length) {
            req.flash('error', 'Provided address not found or invalid.');
            done('Provided address not found or invalid.');
            return;
          }
          done(null, locationData);
        });
      } else {
        done(null, false);
      }
    },
    function updateImage(locationData, done) {
      let updateImage = typeof (req.file) === "undefined" ? false : true;
      if (updateImage) {
        cloudinary.uploader.upload(req.file.path, (err, fileResult) => {
          if (err) {
            done(err);
            return;
          }
          done(null, locationData, fileResult.secure_url);
        });
      } else {
        done(null, locationData, false);
      }
    },
    function updateCampground(locationData, secureImageUrl, done) {
      if (locationData) {
        req.body.campground.location = {
          address: locationData[0].formattedAddress,
          lat: locationData[0].latitude,
          long: locationData[0].longitude
        };
      }
      if (secureImageUrl) {
        req.body.campground.image = secureImageUrl;
      }
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      };

      Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if (err) {
          done(err);
          return;
        }
        done(null, updatedCampground);
      });
    }
  ], (err, updatedCampground) => {
    if (err) {
      console.error(err);
      return res.redirect('back');
    }
    res.redirect(`/campgrounds/${updatedCampground.id}`);
  });
});

// DELETE - Delete from DB
router.delete('/:id', middleware.isAuthorizedCampground, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, err => {
    if (err) {
      console.error(err);
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