'use strict';

// ************** require *******************
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cronJob = require('cron').CronJob;
const bcrypt = require('bcrypt-nodejs');
const {sendEmail} = require('./emailer/emailer');
const {DATABASE_URL, PORT} = require('./router/config');
const {User} = require('./models');
const userRouter = require('./router/userRouter');
require('dotenv').config();

const app = express();
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));
mongoose.Promise = global.Promise;

// router
app.use('/user', userRouter);


// catch all
app.get('*', (req, res) => {
  res.json({message: 'not found'});
}); // end catch all


//**************** cron job ***********************
// pattern *(min) *(hr) *(d) *(m) *(d of w)

const job = new cronJob('*/1 * * * *', () => {
  let currentTime = Date.parse(new Date());
  currentTime = Math.floor(currentTime / 1000 / 60);
  console.log(`now: ${currentTime}`);

  User
    .find({'alertOn': true})
    .exec()
    .then(users => {
      console.log(users);
      users.forEach((user) => {
        if(currentTime === user.alarmTime){

          // setting alarm to another hour
          let alarmTime = new Date(Date.parse(new Date()) + (1 * 60 * 60 * 1000));
          alarmTime = Math.floor(alarmTime / 1000 / 60);
          let query = {'alarmTime': alarmTime};

          // update user with new alarm time
          User
          .findOneAndUpdate({email: user.email}, {$set: query}, {new: true})
          .exec()
          .then(() => {
            // send email to non-community
            if(user.community === false){
              user.contacts.forEach((contact) => {
                if(contact.verified === true){
                  sendEmail({
                    from: '"Friend-Alert" <friend.alert.app@gmail.com>',
                    to: contact.email,
                    subject: `Friend-Alert alarm for ${user.name}`,
                    html: `Dear ${contact.name},<br><br>${user.name} ` +
                    `signed you up as an emergency contact and is late for his/her alarm time. ` +
                    `You will receive this alert every hour until the alarm is turned off.<br><br>` +
                    `Contact info:<br>${user.email}<br><br>If you verified that ${user.name} is ok, ` +
                    `click <a href="https://friend-alert.herokuapp.com/user/time/${user.email}">here</a> to turn off the alarm.<br><br>` +
                    `------------------------- ${user.name}'s message ------------------------- <br><br>${user.message}`
                  });
                  console.log(`send email for user ${user.email}, to ${contact.email}`);
                }
              });
              res.send('success');
            } // end non-community
            
            // community 
            if(user.community === true){
              User
              .find({community: true})
              .exec()
              .then((communities) => {
                communities.forEach((member) => {
                  if(member.email != user.email){
                    sendEmail({
                      from: '"Friend-Alert" <friend.alert.app@gmail.com>',
                      to: member.email,
                      subject: `Friend-Alert Community Alarm for ${user.name}`,
                      html: `Dear ${member.name}<br><br>Friend-Alert community member ${user.name} is late for his/her alarm. ` +
                      `You will receive this alert every hour until the alarm is turned off.<br><br>If you verified that ${user.name} is ok, ` +
                      `click <a href="https://friend-alert.herokuapp.com/user/time/${user.email}">here</a> to turn off the alarm.<br><br>` +
                      `-------------------------  ${user.name}'s message ------------------------- <br><br>${user.message}`
                    });
                  }
                });
                res.send('success');
              })
              .catch(err => res.status(500).json({message: 'something went wrong'}));
            } // end community
          })
          .catch(err => res.status(500).json({message: 'something went wrong'}));
          // send email to user
          sendEmail({
            from: '"Friend-Alert" <friend.alert.app@gmail.com>',
            to: user.email,
            subject: `Friend-Alert Alarm Sent`,
            html: `Dear ${user.name}<br><br>Your alarm time is up and alerts have been sent out. ` +
            `Alerts will be send every hour until the alarm is turned off either by you or your contacts/community members.<br><br>` +
            `click <a href="https://friend-alert.herokuapp.com/user/time/${user.email}">here</a> to turn off the alarm.<br><br>` +
            `-------------------------- Your message ------------------------ <br><br>${user.message}`
          });
        } // end if(currentTime === alarmTime)
      }); // end users.forEach((user))
    })
    .catch(err => res.status(500).json({message: 'something went wrong'}));
});
  
//*************** server **************************

let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, (err) => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};
// start cronjob after server starts
job.start();

module.exports = {app, runServer, closeServer};