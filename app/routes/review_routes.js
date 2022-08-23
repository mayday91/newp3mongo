// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// dotenv
// require("dotenv").config()

// pull in Mongoose model for reviews
const Review = require('../models/review')


// require axios
const axios = require("axios")

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()


// INDEX - GET /reviews
router.get('/reviews', (req, res, next) => {
	Review.find()
		.then((reviews) => {
			return reviews.map((review) => review.toObject())
		})
		.then((reviews) => res.status(200).json({ reviews: reviews }))
		.catch(next)
})

// SHOW - GET /reviews/:id
router.get('/reviews/:id', (req, res, next) => {
	Review.findById(req.params.id)
		.then(handle404)
		.then((review) => {
			// Error: Mongoose does not support calling populate() on nested docs. Instead of `doc.arr[0].populate("path")`, use `doc.populate("arr.0.path")`
			const myReview = review
			console.log('myReview before populate', myReview)
			// myReview.comments.forEach((comment, commentIndex) => 
			// myReview.populate())
			Review.populate(myReview.comments, {'path': 'owner'})
			console.log('myReview after populate', myReview)
			console.log('andrew tryin to see if we populated, will return boolean', myReview.populated('comments[0].owner'))
			console.log(myReview.comments[0])
			return myReview
		})
		.then((review) => res.status(200).json({ review: review.toObject() }))
		.catch(next)
})

// CREATE - POST /reviews
router.post('/reviews', requireToken, (req, res, next) => {
	req.body.review.owner = req.user.id
	const review = req.body.review
	review.userName = req.user.email
	Review.create(req.body.review)
		.then((review) => {
			res.status(201).json({ review: review.toObject() })
		})
		.catch(next)
})

// UPDATE
// PATCH /reviews/:id
router.patch('/reviews/:id', requireToken, removeBlanks, (req, res, next) => {
	delete req.body.review.owner

	Review.findById(req.params.id)
		.then(handle404)
		.then((review) => {
			requireOwnership(req, review)
			return review.updateOne(req.body.review)
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

// DESTROY - DELETE /reviews/:id
router.delete('/reviews/:id', requireToken, (req, res, next) => {
	Review.findById(req.params.id)
		.then(handle404)
		.then((review) => {
			requireOwnership(req, review)
			review.deleteOne()
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

module.exports = router
