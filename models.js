const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    name: {type: String},
    phone: {type: Number},
    contacts: [{
        name: String,
        email: {type: String, unique: true},
        phone: Number,
        verified: {type: Boolean, default: false},
        opt_out: {type: Boolean, default: false}
    }],
    community: {type: Boolean, default: false},
    startTime: {type: Number},
    alarmTime: {type: Number},
    alertOn: {type: Boolean, default: false}
});

const User = mongoose.model('User', userSchema);

module.exports = {User};