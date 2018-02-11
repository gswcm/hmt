const mongoose = require('mongoose');
const scanSchema = require('../schemas/scan');

module.exports = mongoose.model('scan', scanSchema);