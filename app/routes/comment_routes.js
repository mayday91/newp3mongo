const express = require('express')
const passport = require('passport')
const Review = require('../models/review')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()


// POST /:reviewId
router.post('/comments/:reviewId', removeBlanks, (req, res, next) => {
  const reviewId = req.params.reviewId

  Review.findById(reviewId)
  .then(review => {
      review.comments.push(req.body)
      console.log('this is the comment', req.body)
      return review.save()
  })
  .then(review => res.status(201).json({ review: review }))
  .then(review => {
      res.redirect(`/reviews/${review._id}`)
  })
  .catch(err => {
      res.json(err)
  })
})

/// DELETE - Comment Delete
router.delete('/comments/:reviewId/:commentId', requireToken, (req, res) => {
  const reviewId = req.params.reviewId
  const commentId = req.params.commentId

  Review.findById(reviewId)
  .then(review => {
      const comment = review.comments.id(commentId)
      requireOwnership(req, comment)
      comment.remove()
      return review.save()
  })
  .then(() => res.sendStatus(204))
  .then(review => {
      res.redirect(`/reviews/${reviewId}`)
  })
  .catch(err => {
      console.log(err)
  })
 
})

module.exports = router