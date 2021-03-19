const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewsSchema = new Schema({
  review_id: {
    type: Number,
    required: [true, 'Review ID is required.']
  },
  rating: {
    type: Number,
    validate: {
      validator: (number) => ((number > 0) && (number <= 5)),
      message: 'Rating must be between 1 and 5'
    },
    required: [true, 'Rating is required.']
  },
  summary: {
    type: String,
    required: [true, 'Summary is required.']
  },
  recommend: {
    type: Boolean,
    required: [true, 'Recommend is required.']
  },
  response: {
    type: String,
    default: null,
  },
  body: {
    type: String,
    required: [true, 'Body is required.']
  },
  // date: Date,
  // reviewer_name: String,
  // helpfulness: Number,
  // photos: [String],
});

const Review = mongoose.model('review', ReviewsSchema);

module.exports = Review;