const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharsImportSchema = new Schema({
  id: Number,
  product_id: Number,
  name: String
}, { collection: 'charsImport' });

const CharsImport = mongoose.model('charsImport', CharsImportSchema);

module.exports = CharsImport;
