const mongoose = require('mongoose');
const counterSchema = require('../schemas/counter');

module.exports = mongoose.model("Counter", counterSchema);