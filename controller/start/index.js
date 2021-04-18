'use strict';

const Tourist = require('@root/models/tourist');
const secret = require('@root/secret.js');
const regular = require('@root/regular');

const checkTourist = async (req, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  if (fullNameValidation(sentMessage)) {
    let len;
    await Tourist.find({ full_name: sentMessage }, (err, docs) => {
      if (err) return console.error(err);
      len = docs.length;
      return docs;
    });
    if (len === 1) {
      send('You are in our tourist base. Welcome to YourTourBot', 'none');
      return 'WAITING COMMAND';
    }

    send('You were not found in our database. Please buy a tour from our travel agency', 'none');
    return 'WAITING REGISTRATION';
  }
  send('Please, enter full name in right format: Surname Name', 'none');
  return 'WAITING NAME AGAIN';
};

const fullNameValidation = (name) => {
  if (name.match(regular.validFullName)) {
    return true;
  }
  return false;
};

const checkPassword = async (req, send) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  if (sentMessage === secret.adminPassword) {
    send('Please enter a command', 'admin');
  } else {
    send('Password is wrong. \n❌You are not admin❌', 'simple');
  }
  return sentMessage === secret.adminPassword ? 'WAITING COMMAND' : 'WAITING CHOICE AGAIN';
};

module.exports = {
  checkTourist,
  checkPassword
};
