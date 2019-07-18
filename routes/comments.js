//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Require packages
const express    = require('express');

// Require models
const Campground = require('../models/campground'),
      Comment    = require('../models/comment');

// Require middlware
const middleware = require('../middleware');

// Create package associations
const router     = express.Router({mergeParams: true});


//////////////////////////////////////////////////
// Route configuration
//////////////////////////////////////////////////

// NEW - Display the 'add new comment' form
router.get('/new', middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
      req.flash('error', 'Campground not found.');
      return req.redirect('back');
    }
    res.render('comments/new', {campground: campground});
  })
});

// CREATE - Add new comment to DB
router.post('/', middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
      req.flash('error', 'Campground not found.');
      return res.redirect('/campgrounds');
    }
    Comment.create(req.body.comment, (err, comment) => {
      if (err) {
        console.log(err);
        req.flash('error', 'We are unable to perform your request at this time.');
        return req.redirect('back');
      }
      comment.author.id = req.user._id;
      comment.author.username = req.user.username;
      comment.save();
      campground.comments.push(comment);
      campground.save();
      res.redirect(`/campgrounds/${campground._id}`);
    });
  });
});

// EDIT - Display edit form
router.get('/:comment_id/edit', middleware.isAuthorizedComment, (req, res) => {
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) {
      console.log(err);
      req.flash('error', 'Comment not found.');
      return res.redirect('back');
    }
    res.render('comments/edit', {
      campground_id: req.params.id,
      comment: foundComment
    });
  });
});

// UPDATE - Save edits to DB
router.put('/:comment_id', middleware.isAuthorizedComment, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if (err) {
      console.log(err);
      req.flash('error', 'Comment not found.');
      return res.redirect('back');
    }
    res.redirect(`/campgrounds/${req.params.id}`);
  });
});

// DELETE - Delete from DB
router.delete('/:comment_id', middleware.isAuthorizedComment, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, err => {
    if (err) {
      console.log(err);
      req.flash('error', 'Comment not found.');
      return res.redirect('back');
    }
    req.flash('success', 'You\'re comment has been deleted successfully.');
    res.redirect(`/campgrounds/${req.params.id}`);
  });
});


//////////////////////////////////////////////////
// Export
//////////////////////////////////////////////////

module.exports = router;