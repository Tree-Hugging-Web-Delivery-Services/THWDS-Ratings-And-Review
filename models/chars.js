const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharsSchema = new Schema({
  product_id: Number,
  characteristic_id: Number,
  name: String,
  review_id: Number,
  value: Number,
});

const Chars = mongoose.model('chars', CharsSchema);

module.exports = Chars;
