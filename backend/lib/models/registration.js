const mongoose = require('mongoose');
const registrationSchema = require('../schemas/registration');

module.exports = mongoose.model("Registration", registrationSchema);
