const mongoose = require('mongoose');
const timelineSchema = require('../schemas/timeline');

module.exports = mongoose.model("Timeline", timelineSchema);
