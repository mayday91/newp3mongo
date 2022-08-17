// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for reviews
const Review = require('../models/review')

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
		.populate('owner')
		.then((reviews) => {
			return reviews.map((review) => review.toObject())
		})
		.then((reviews) => res.status(200).json({ reviews: reviews }))
		.catch(next)
})

// SHOW - GET /reviews/:id
router.get('/reviews/:id', (req, res, next) => {
	Review.findById(req.params.id)
		.populate('owner')
		.then(handle404)
		.then((review) => res.status(200).json({ review: review.toObject() }))
		.catch(next)
})

// CREATE - POST /reviews
router.post('/reviews', requireToken, (req, res, next) => {
	req.body.review.owner = req.user.id

	Review.create(req.body.review)
		.then((review) => {
			res.status(201).json({ review: review.toObject() })
		})
		.catch(next)
})

// UPDATE
// PATCH /reviews/:id
router.patch('/reviews/:id', requireToken, removeBlanks, (req, res, next) => {
	delete req.body.example.owner

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
			Review.deleteOne()
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

module.exports = router
