const mongoose = require('mongoose');
const accountSchema = require('../schemas/account');

module.exports = mongoose.model('Account', accountSchema);
