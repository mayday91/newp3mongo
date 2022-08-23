const mongoose = require('mongoose')
const commentSchema = require('./comment')
const { Schema, model } = mongoose

const reviewSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		artist: {
			type: String,
			required: true,
		},
		body: {
			type: String,
			required: true,
		},
		comments: [commentSchema],
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		userName: {
			type: String,
			required: true
		}
	}
)

module.exports = model('Review', reviewSchema)
