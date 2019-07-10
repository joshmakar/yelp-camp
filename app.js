//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

const express     = require('express'),
      bodyParser  = require('body-parser'),
      mongoose    = require('mongoose'),
      app         = express(),
      Campground  = require('./models/campground'),
      Comment     = require('./models/comment'),
      seedDB      = require('./seeds.js');

// Console logging decoration
const chalk       = require('chalk'),
      error       = chalk.bold.red,
      warning     = chalk.keyword('orange');

mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));

// Add placeholder data to DB
//seedDB();


//////////////////////////////////////////////////
// Root route
//////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.render('landing');
});


//////////////////////////////////////////////////
// Campgrounds
//////////////////////////////////////////////////

// Base URL
const campgroundsURL = '/campgrounds';

// INDEX - Display all campgrounds
app.get(campgroundsURL, (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(error(err));
    } else {
      res.render('campgrounds/index', {campgrounds: allCampgrounds});
    }
  });
});

// NEW - Display the 'add new campground' form
app.get(campgroundsURL + '/new', (req, res) => {
  res.render('campgrounds/new');
});

// CREATE - Add new campground to DB
app.post(campgroundsURL, (req, res) => {
  const name   = req.body.campground.name,
        image  = req.body.campground.img,
        desc   = req.body.campground.desc;
  const newCampground = {name: name, image: image, description: desc};
  
  // Add new campground to DB
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err) {
      console.log(error(err));
    } else {
      res.redirect(campgroundsURL);
    }
  });
});

// SHOW - Display campground info
app.get(`${campgroundsURL}/:id`, (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, foundCampground) => {
    if (err) {
      console.log(error(err));
    } else {
      console.log(foundCampground);
      res.render('campgrounds/show', {campground: foundCampground});
    }
  });
});


//////////////////////////////////////////////////
// Comments
//////////////////////////////////////////////////

// NEW - Display the 'add new comment' form
app.get(`${campgroundsURL}/:id/comments/new`, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(error(err));
    } else {
      res.render('comments/new', {campground: campground});
    }
  })
});

// CREATE - Add new comment to DB
app.post(`${campgroundsURL}/:id/comments`, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(error(err));
      res.redirect(campgroundsURL);
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          console.log(error(err));
        } else {
          campground.comments.push(comment);
          campground.save();
          res.redirect(`${campgroundsURL}/${campground._id}`);
        }
      });
    }
  });
});


//////////////////////////////////////////////////
// Start listening
//////////////////////////////////////////////////

app.listen(3000, () => {
  console.log('Yelp Camp App Running');
});


//////////////////////////////////////////////////
// Notes
//////////////////////////////////////////////////

/*

REST - The 7 Routes
 Name       Path           HTTP Verb      Purpose
 Index      /things          GET            List all
┌New        /things/new      GET            Show new form
└Create     /things          POST           Create & redirect
 Show       /things:id       GET            Show specific info
┌Edit       /things:id/edit  GET            Show edit form
└Update     /things:id       PUT            Update & redirect
 Destroy    /things:id       DELETE         Delete & redirect

*/