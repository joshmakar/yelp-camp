//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

const mongoose              = require('mongoose'),
      passportLocalMongoose = require('passport-local-mongoose');


//////////////////////////////////////////////////
// Schema Setup
//////////////////////////////////////////////////

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  firstName: String,
  lastName: String,
  avatar: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);