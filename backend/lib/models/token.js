const mongoose = require('mongoose');
const tokenSchema = require('../schemas/token');

module.exports = mongoose.model('Token', tokenSchema);