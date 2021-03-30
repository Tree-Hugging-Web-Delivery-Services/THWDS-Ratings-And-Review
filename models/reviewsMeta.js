const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewsMetaSchema = new Schema({
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
      char_id: Number,
      char_name: String,
      value: Number,
    },
  ],
  reviews: [Number],
  reviewsCount: Number,
}, {collection: 'reviewsMeta'});



const ReviewsMeta = mongoose.model('reviewsMeta', ReviewsMetaSchema);

module.exports = ReviewsMeta;