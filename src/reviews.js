const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewsSchema = new Schema({
  review_id: Number,
  rating: Number,
  summary: String,
  recommend: Boolean,
  response: String,
  body: String,
  date: Timestamp,
  reviewer_name: String,
  helpfulness: Number,
  photos: [
    String,
  ],
});