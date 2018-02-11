const mongoose = require('mongoose');
const archiveSchema = require('../schemas/archive');

module.exports = mongoose.model('Archive', archiveSchema);