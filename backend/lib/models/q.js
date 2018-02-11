const mongoose = require('mongoose');
const qSchema = require('../schemas/q');

module.exports = mongoose.model('Q', qSchema);