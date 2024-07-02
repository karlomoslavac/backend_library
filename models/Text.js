const mongoose = require('mongoose');

const textSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  pageCount: { type: Number, required: true },
  image: { type: String, required: true },
  comments: [{ type: String }],
  ratings: [{ type: Number }],
});

module.exports = mongoose.model('Text', textSchema);
