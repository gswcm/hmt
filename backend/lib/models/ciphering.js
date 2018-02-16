const mongoose = require('mongoose');
const cipheringSchema = require('../schemas/ciphering');

module.exports = mongoose.model('ciphering', cipheringSchema);

