//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

const mongoose    = require('mongoose'),
      Campground  = require('./models/campground'),
      Comment     = require('./models/comment'),
      User        = require('./models/user');

const chalk       = require('chalk'),
      error       = chalk.bold.red,
      warning     = chalk.keyword('orange');


//////////////////////////////////////////////////
// Starter Data
//////////////////////////////////////////////////

const data = [
  {
    name: 'Cloud\'s Rest', 
    image: 'https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloremque ipsum porro facere quia. Dolor sunt placeat obcaecati sequi aliquid. Officia earum magnam illum obcaecati adipisci temporibus delectus aspernatur, error quod necessitatibus, sit quo vel laborum ratione unde ad magni quas! Sunt commodi inventore odit ratione est aliquid facere molestiae obcaecati nostrum non ad, fugiat consequatur temporibus libero quod reprehenderit in tempore quaerat perferendis quasi tempora natus, quo nam! Sint, facilis.'
  },
  {
    name: 'Desert Mesa', 
    image: 'https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic dignissimos vero dicta quia commodi odit assumenda quibusdam est totam debitis culpa ipsum temporibus, iure nesciunt officia nisi natus nihil facere odio. Voluptas odio, ducimus id, dolorem ipsa animi neque voluptates voluptate! Velit eaque dignissimos, vero odio error dolorem sint cum.'
  },
  {
    name: 'Canyon Floor', 
    image: 'https://farm1.staticflickr.com/189/493046463_841a18169e.jpg',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam magnam facere quam dolores suscipit illum debitis modi, animi earum ipsa autem a id rerum mollitia odio, doloribus cum ipsum laudantium, repudiandae quasi assumenda possimus repellendus maiores adipisci! Rerum veritatis, mollitia odio porro corporis saepe. Commodi minus, temporibus quas voluptatem vel blanditiis laboriosam libero optio hic aperiam adipisci, eum, vero. Rem dolorum sed maxime quae, quo eum non iste sit ab maiores nam quam iusto, obcaecati perspiciatis animi voluptatem. Sunt, qui.'
  }
];


//////////////////////////////////////////////////
// Seed the DB
//////////////////////////////////////////////////

function seedDB(modifier = ['default']){
  // Remove all campgrounds
  Campground.deleteMany({}, (err) => {
    if(err){
      return console.log(error(err));
    }
    console.log('Removed Campgrounds!');
    // Remove all comments
    Comment.deleteMany({}, err => {
      if (err) {
        return console.log(error(err));
      }
      console.log('Removed Comments!');
      // Remove all users
      User.deleteMany({}, err => {
        if (err) {
          return console.log(error(err));
        }
        console.log('Removed Users!');
        // Skip seeding?
        if (modifier.includes('clearOnly')) {
          return console.log('Seeding has been skipped');
        }
        // Add a few campgrounds
        data.forEach(seed => {
          Campground.create(seed, (err, campground) => {
            if (err) {
              return console.log(error(err));
            }
            console.log('Added a campground');
            // Create a comment
            Comment.create({
              text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio, dignissimos.',
              author: 'Homer'
            }, (err, comment) => {
              if (err) {
                console.log(error(err));
              } else {
                campground.comments.push(comment);
                campground.save();
                console.log('Created new comment');
              }
            });
          });
        });
      });
    });
  });
}

module.exports = seedDB;