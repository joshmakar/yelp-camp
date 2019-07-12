//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

const mongoose    = require('mongoose');


//////////////////////////////////////////////////
// Schema Setup
//////////////////////////////////////////////////

const commentSchema = new mongoose.Schema({
  text: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      re: "User"
    },
    username: String
  }
});

module.exports = mongoose.model('Comment', commentSchema);