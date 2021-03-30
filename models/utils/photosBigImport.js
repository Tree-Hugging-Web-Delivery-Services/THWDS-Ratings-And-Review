const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhotosBigImportSchema = new Schema({
  id: Number,
  review_id: Number,
  url: String,
}, {collection: 'photosBigImport'});

const PhotosBigImport = mongoose.model('photosBigImport', PhotosBigImportSchema);

module.exports = PhotosBigImport;
