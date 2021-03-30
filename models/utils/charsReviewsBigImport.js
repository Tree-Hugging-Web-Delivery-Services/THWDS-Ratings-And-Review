const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharsReviewsBigImportSchema = new Schema({
  id: Number,
  characteristic_id: Number,
  review_id: Number,
  value: Number,
  name: String,
}, {collection: 'charReviewsBigImport'});

const CharsReviewsBigImport = mongoose.model('charsReviewsBigImport', CharsReviewsBigImportSchema);

module.exports = CharsReviewsBigImport;
