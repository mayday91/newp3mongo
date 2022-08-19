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
router.post('/comments/:reviewId', requireToken, (req, res, next) => {
    console.log(req.user)
    const comment = req.body.comment
    comment.owner = req.user.id
    comment.userName = req.user.email
    console.log(req.user.email)
    console.log(comment)
    const reviewId = req.params.reviewId
    
    Review.findById(reviewId)
        .then(handle404)
        .then(review => {
            console.log('this is the review', review)
            console.log('this is the comment', comment)
            review.comments.push(comment)

            return review.save()
            
        })
        .then(review => res.status(201).json({ review: review }))
        .catch(next)
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