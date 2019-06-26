//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

const express     = require('express'),
      bodyParser  = require('body-parser'),
      mongoose    = require('mongoose'),
      app         = express();

mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


//////////////////////////////////////////////////
// Schema Setup
//////////////////////////////////////////////////

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String
}),
Campground = mongoose.model('Campground', campgroundSchema);


// Campground.create({
//   name: 'Granite Hill',
//   image: 'https://farm8.staticflickr.com/7457/9586944536_9c61259490.jpg',
//   description: 'This is a huge granite hill, no bathrooms or water fountains. Beautiful granite!'
// }, (err, campground) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('Newly created campground');
//     console.log(campground);
//   }
// });


//////////////////////////////////////////////////
// Landing page
//////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.render('landing');
})


//////////////////////////////////////////////////
// Campgrounds
//////////////////////////////////////////////////

// Base URL
const campgroundsURL = '/campgrounds';

// INDEX - Display campgrounds
app.get(campgroundsURL, (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(err);
    } else {
      res.render('index',{campgrounds: allCampgrounds});
    }
  });
});

// NEW - Display add new campground form
app.get(campgroundsURL + '/new', (req, res) => {
  res.render('new');
});

// CREATE - Add new campground to db
app.post(campgroundsURL, (req, res) => {
  let name   = req.body['campground-name'],
      image  = req.body['campground-img'],
      desc   = req.body['campground-desc'];
  let newCampground = {name: name, image: image, description: desc};
  
  // Create new campground in DB
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect(campgroundsURL);
    }
  });
});

// SHOW - Display campground info
app.get('/campgrounds/:id', (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render('show', {campground: foundCampground});
    }
  });
});


//////////////////////////////////////////////////
// Start listening
//////////////////////////////////////////////////

app.listen(3000, () => {
  console.log('Yelp Camp App Running');
});