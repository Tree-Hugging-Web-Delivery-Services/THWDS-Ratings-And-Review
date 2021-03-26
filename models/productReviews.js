const mongoose = require('mongoose');
const ReviewSchema = require('./reviewSchema');
const Schema = mongoose.Schema;

const ReviewsSchema = new Schema({
  product_id: {
    type: Number,
    required: [true, 'Product ID is required.']
  },
  ratings: {
    5: Number,
    4: Number,
    3: Number,
    2: Number,
    1: Number,
  },
  recommended: {
    false: Number,
    true: Number,
  },
  characteristics: [
    {
      characteristic_id: Number,
      characteristic_name: String,
      characteristic_value: Number,
    },
  ],
  reviews: [ {
    type: Schema.Types.ObjectId,
    ref: 'reviews'
  } ],
});



const ProductReviews = mongoose.model('productReviews', ReviewsSchema);

module.exports = Reviews;