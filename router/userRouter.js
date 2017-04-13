'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const {User} = require('../models');
const {sendEmail} = require('../emailer/emailer');
router.use(bodyParser.json());

// GET all users
router.get('/', (req, res) => {
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
router.get('/:email', (req, res) => {
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

// Check user password
// router.get('/:email/:password', (req, res) => {
//     User
//         .findOne({email: req.params.email})
//         .exec()
//         .then(user => {
//             console.log('then')
//             if(!bcrypt.compareSync(req.params.password, user.password)){
//                 return res.status(200).json([{'password': false}]);
//             }
//             return res.status(200).json([{'password': true}]);
//         })
//         .catch(err => res.status(200).json([]));
// });

// POST new user
router.post('/', (req, res) => {
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

      //hash password
      //let hash = bcrypt.hashSync(req.body.password);

      // create new user
      const newUser = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name || '',
        community: false,
        message: '',
        alarmTime: 0,
        alertOn: false
      };
      return User.create(newUser);
    })
    .then(user => {
      return res.status(201).json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went wrong'});
    });
}); // end POST

//DELETE a user
router.delete('/:email', (req, res) => {
  User
  .findOneAndRemove({email: req.params.email})
  .exec()
  .then(deletedUser => {
    if(deletedUser === null){
      console.log("can't find user to delete");
      return res.status(400).json({message: "can't find user to delete"});
    }
    return res.status(204).json({message: `deleted user ${deletedUser.email}`});
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'something went wrong'});
  });
}); // end DELETE user

// Turn off alarm
router.get('/time/:email', (req, res) => {
  console.log('turning off alarm');
  let query = {'alarmTime': 0, 'message': '', 'alertOn': false};

  User
  .findOneAndUpdate({email: req.params.email}, {$set: query}, {new: true})
  .exec()
  .then(updated => res.redirect('https://friend-alert.herokuapp.com/alarm-off.html'))
  .catch(err => res.status(500).json({message: 'something went wrong'}));
});


// UPDATE a user
router.put('/:email', (req, res) => {
  let updateUser = {};
  const updateableFields = ['email', 'password', 'name', 'community', 'message', 'alarmTime', 'alertOn', 'contacts'];
  updateableFields.forEach(field => {
    if(field in req.body){
      updateUser[field] = req.body[field];
    }
  });

  // hash password
  //if('password' in req.body)
     //updateUser[password] = bcrypt.hashSync(updateUser[password]);

  // If adding new contact, send sign-up email to contact
  if(req.body.contacts){
    User
    .findOne({'email': req.params.email})
    .exec()
    .then((user) => {
      if(req.body.contacts.length > user.contacts.length){
        let newContact = req.body.contacts[req.body.contacts.length - 1];
        let emailData = {
          from: '"Friend-Alert" <friend.alert.app@gmail.com>',
          to: newContact.email,
          subject: `Friend-Alert contact verification from ${user.name}`,
          html: `Dear ${newContact.name},<br><br>${user.name} ` +
          `signed you up as an emergency contact on Friend-Alert. ` +
          `As an emergy contact, you will be alerted by email when ` +
          `${user.name} is late for his/her user set alarm.<br><br>` +
          `If you agree to be a Friend-Alert emergency contact, click ` +
          `<a href="https://friend-alert.herokuapp.com/user/${req.params.email}/${newContact.email}" target="_blank">here</a>.`
        };
        sendEmail(emailData);
      }
    }); // end then
  } // end sending email to new contact

  User
  .findOneAndUpdate({email: req.params.email}, {$set: updateUser}, {new: true})
  .exec()
  .then(updatedPost => res.status(201).json(updatedPost))
  .catch(err => res.status(500).json({message: 'something went wrong'}));
  
}) // end UPDATE user

//************* contact management ***************/

//contact self-verify
router.get('/:email/:contact', (req, res) => {
  //find user's contacts
  let contacts = [];
  User
  .findOne({'email': req.params.email})
  .exec()
  .then(user => {
    contacts = user.contacts;
    contacts.forEach((contact) => {
      if(contact.email === req.params.contact){
        contact.verified = true;
      }
    });
    let query = {'contacts': contacts};
    User
    .findOneAndUpdate({'email': req.params.email}, {$set: query}, {new: true})
    .exec()
    .then(() => res.redirect('https://friend-alert.herokuapp.com/verified.html'))
    .catch(err => res.status(500).json({message: 'something went wrong'}));
  });
})

//****************** timer ************************/

// Set timer
router.put('/time/:email', (req, res) => {

  let alarmTime = new Date(Date.parse(new Date()) + (req.body.hour * 60 * 60 * 1000) + (req.body.min * 60 * 1000));
  alarmTime = Math.floor(alarmTime / 1000 / 60);

  if(req.body.hour === 0 && req.body.min === 0){
    alarmTime = 0;
  }

  let query = {'alarmTime': alarmTime, 'message': req.body.message , 'alertOn': req.body.alertOn};

  User
  .findOneAndUpdate({email: req.params.email}, {$set: query}, {new: true})
  .exec()
  .then(updated => res.status(201).json(updated))
  .catch(err => res.status(500).json({message: 'something went wrong'}));
});


module.exports = router;