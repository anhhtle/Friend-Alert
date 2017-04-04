'use strict';

// ************** require *******************
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cronJob = require('cron').CronJob;
const moment = require('moment');
const {sendEmail} = require('./emailer/emailer');
const {DATABASE_URL, PORT} = require('./router/config');
const {User} = require('./models');
require('dotenv').config();

const app = express();
app.use(morgan('common'));
app.use(bodyParser.json());
app.use('/static', express.static('public'));
mongoose.Promise = global.Promise;

// ******************* API ************************

// GET all users
app.get('/user/', (req, res) => {
  User
    .find()
    .exec()
    .then(users => {
      console.log(users);
      res.status(200).json(users);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
}) // end GET all users

// GET specific user
app.get('/user/:email', (req, res) => {
  User
    .find({email: req.params.email})
    .exec()
    .then(user => {
      console.log(user);
      return res.json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
}) // end GET specific users

// POST new user
app.post('/user', (req, res) => {
  // check for required fields
  console.log(req.body);
  const requiredFields = ['email', 'password'];
  for(let i = 0; i < requiredFields.length; i++){
    const field = requiredFields[i];
    if(!(field in req.body)){
      console.log(req.body);
      const message = `missing '${field}' in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  } // end for
  // check to see if email is registered already
  return User
    .find({email: req.body.email})
    .count()
    .exec()
    .then(count => {
      if(count > 0){
        console.log('email is already registered');
        return res.status(422).send('email is already registered');
      }
      // create new user
      const newUser = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name || '',
        phone: req.body.phone || 0,
        contacts: [],
        community: false,
        startTime: 0,
        alarmTime: 0,
        alertOn: false
      };
      return User.create(newUser);
    })
    .then(user => {
      // question... function work but getting 'Error: can't set headers after they are sent'
      return res.status(201).json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });

}); // end POST

// DELETE a user
app.delete('/user/:email', (req, res) => {
  User
  .findOneAndRemove({email: req.params.email})
  .exec()
  .then(deletedUser => {
    if(deletedUser === null){
      console.log("can't find user to delete");
      return res.status(400).json({message: "can't find user to delete"});
    }
    return res.status(200).json({message: `deleted user ${deletedUser.email}`});
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'something went wrong'});
  });
}); // end DELETE user

// UPDATE a user
app.put('/user/:email', (req, res) => {
  let updateUser = {};
  const updateableFields = ['email', 'password', 'name', 'phone', 'community', 'startTime', 'alarmTime', 'alertOn', 'contacts'];
  updateableFields.forEach(field => {
    if(field in req.body){
      updateUser[field] = req.body[field];
    }
  });

  User
  .findOneAndUpdate({email: req.params.email}, {$set: updateUser}, {new: true})
  .exec()
  .then(updatedPost => res.status(201).json(updatedPost))
  .catch(err => res.status(500).json({message: 'something went wrong'}));
  
}) // end UPDATE user

// verify contact
// app.get('/user/:email/:contact', (req, res) => {
//   console.log(req.params.contact);
//   let arr = [];

//   // find user's contact
//   User
//   .findOne({email: req.params.email})
//   .exec()
//   .then((user) => {
//     arr = user.contacts;
//     for(let i = 0; i <= query.length; i++){
//       if(arr[i].email === req.params.contact){
//         arr[i].verified = true;
//       } 
//     }
//   });

//   console.log(arr);
//   let query = {contacts: arr};

//   // update contact's verify status
//   User
//   .findOneAndUpdate({email: req.params.email}, {$set: query}, {new: true})
//   .exec()
//   .then(updated => res.status(201).json(updated))
//   .catch(err => res.status(500).json({message: 'something went wrong'}));

// })

// Set timer
app.put('/user/time/:email', (req, res) => {
  let startTime = Date.parse(new Date());
  startTime = Math.floor(startTime / 1000 / 60); 

  let alarmTime = new Date(Date.parse(new Date()) + (req.body.hour * 60 * 60 * 1000) + (req.body.min * 60 * 1000));
  alarmTime = Math.floor(alarmTime / 1000 / 60);

  if(req.body.hour === 0 && req.body.min === 0){
    startTime = 0;
    alarmTime = 0;
  }

  let query = {'startTime': startTime, 'alarmTime': alarmTime};

  User
  .findOneAndUpdate({email: req.params.email}, {$set: query}, {new: true})
  .exec()
  .then(updated => res.status(201).json(updated))
  .catch(err => res.status(500).json({message: 'something went wrong'}));
});


// catch all
app.get('*', (req, res) => {
  res.json({message: 'not found'});
}); // end catch all


//**************** timer *************************

//**************** cron job ***********************
// pattern *(min) *(hr) *(d) *(m) *(d of w)

const job = new cronJob('*/1 * * * *', () => {
  //const currentTime = moment().format('HH:mm');
  let currentTime = Date.parse(new Date());
  currentTime = Math.floor(currentTime / 1000 / 60);
  console.log(`now: ${currentTime}`);

  User
    .find({'alarmTime': {'$exists': true, '$ne': 0}})
    .exec()
    .then(users => {
      console.log(users);
      users.forEach((user) => {
        if(currentTime === user.alarmTime){
          let emailData = {
            from: process.env.ALERT_FROM_EMAIL,
            to: process.env.ALERT_TO_EMAIL,
            subject: user.email + `: alarmTime is ${user.alarmTime}`,
            text: "Plain text content",
            html: `testing html`
          };
          sendEmail(emailData);
          console.log(`send email for user ${user.email}`);
        } // end if
      }); // end forEach
    })
    .catch(err => {
      console.error(err);
    });
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