const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharsBigImportSchema = new Schema({
  id: Number,
  product_id: Number,
  name: String
}, { collection: 'charsBigImport' });

const CharsBigImport = mongoose.model('charsBigImport', CharsBigImportSchema);

module.exports = CharsBigImport;
