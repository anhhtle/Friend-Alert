'use strict'
const nodemailer = require('nodemailer');
const SMTP_URL='smtps://anh.ht.le@gmail.com:anhleash1@smtp.gmail.com';

const sendEmail = (emailData, smtpUrl=SMTP_URL) => {
    const transporter = nodemailer.createTransport(SMTP_URL);
    console.log(`Attempting to send email from ${emailData.from}`);
    return transporter
        .sendMail(emailData)
        .then(info => console.log(`Message sent: ${info.response}`))
        .catch(err => console.log(`problem sending email: ${err}`));
}; // end sendEmail

module.exports = {sendEmail};