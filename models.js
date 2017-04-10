const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {type: String, require: true},
    password: {type: String, require: true},
    name: {type: String},
    phone: {type: Number},
    contacts: [{
        name: String,
        email: String,
        phone: Number,
        verified: {type: Boolean, default: false},
        opt_out: {type: Boolean, default: false}
    }],
    community: {type: Boolean, default: false},
    message: {type: String},
    alarmTime: {type: Number},
    alertOn: {type: Boolean, default: false}
});

const User = mongoose.model('User', userSchema);

module.exports = {User};