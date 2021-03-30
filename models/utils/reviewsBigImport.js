const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewsBigImportSchema = new Schema({
  id: Number,
  product_id: Number,
  rating: Number,
  date: Date,
  summary: String,
  body: String,
  recommend: Boolean,
  reported: Boolean,
  reviewer_name: String,
  reviewer_email: String,
  helpfulness: Number,
  characteristics : [{
    char_name: String,
    char_id: Number,
    value: Number,
  }],
  photos: [{
    id: Number,
    review_id: Number,
    url: String,
  }],
}, {collection: 'reviewsBigImport'});

const ReviewsBigImport = mongoose.model('reviewsBigImport', ReviewsBigImportSchema);

module.exports = ReviewsBigImport;
