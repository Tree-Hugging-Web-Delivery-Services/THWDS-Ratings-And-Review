const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema ({
  review_id: {
    type: Number,
    required: [true, 'Body is required.']
  },
  product_id: {
    type: Number,
    required: [true, 'Body is required.']
  },
  rating: {
    type: Number,
    validate: {
      validator: (number) => ((number > 0) && (number <= 5)),
      message: 'Rating must be between 1 and 5'
    },
  },
  summary: String,
  recommend: Boolean,
  response: {
    type: String,
    default: null,
  },
  body: {
    type: String,
    required: [true, 'Body is required.']
  },
  date: {
    type: Date,
    default: new Date(),
  },
  reviewer_name: {
    type: String,
    required: [true, 'Reviewer name is required.']
  },
  reviewer_email: {
    type: String,
    required: [true, 'Reviewer email is required.']
  },
  helpfulness: {
    type: Number,
    default: 0,
  },
  photos: [ String ],
});

const Reviews = mongoose.model('reviews', ReviewSchema);

module.exports = Reviews;
