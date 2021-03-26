const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewsImportSchema = new Schema({
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
}, {collection: 'reviewsImport'});

const ReviewsImport = mongoose.model('reviewsImport', ReviewsImportSchema);

module.exports = ReviewsImport;
