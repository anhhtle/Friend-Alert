'use strict'
const nodemailer = require('nodemailer');
const SMTP_URL='smtps://friend.alert.app@gmail.com.com:anhleash1@smtp.gmail.com';

const sendEmail = (emailData, smtpUrl=SMTP_URL) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'friend.alert.app@gmail.com',
            pass: 'anhleash1'
        }
    });
    console.log(`Attempting to send email from ${emailData.from}`);
    return transporter
        .sendMail(emailData)
        .then(info => console.log(`Message sent: ${info.response}`))
        .catch(err => console.log(`problem sending email: ${err}`));
}; // end sendEmail

module.exports = {sendEmail};