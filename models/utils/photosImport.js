const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhotosImportSchema = new Schema({
  id: Number,
  review_id: Number,
  url: String,
}, {collection: 'photosImport'});

const PhotosImport = mongoose.model('photosImport', PhotosImportSchema);

module.exports = PhotosImport;
