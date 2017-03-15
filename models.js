const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    name: {type: String},
    phone: {type: Number},
    contact: [{
        name: String,
        email: String,
        phone: Number,
        opt_out: {type: Boolean, default: false}
    }],
    community: {type: Boolean, default: false},
    startTime: {type: String},
    alarmTime: {type: String},
    alertOn: {type: Boolean, default: false}
});

const User = mongoose.model('User', userSchema);

module.exports = {User};