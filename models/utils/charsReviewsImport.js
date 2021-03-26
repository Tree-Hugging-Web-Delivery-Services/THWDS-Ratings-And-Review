const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharsReviewsImportSchema = new Schema({
  id: Number,
  characteristic_id: Number,
  review_id: Number,
  value: Number,
}, {collection: 'charReviewsImport'});

const CharsReviewsImport = mongoose.model('charsReviewsImport', CharsReviewsImportSchema);

module.exports = CharsReviewsImport;
