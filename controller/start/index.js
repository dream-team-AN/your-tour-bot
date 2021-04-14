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
    console.log(len);
    if (len === 1) {
      send('You are in our tourist base. Nice to see you.', 'none');
      return 'WAITING COMMAND';
    }

    send('You were not found in our database. Please buy a tour from our travel agency.', 'none');
    return 'WAITING REGISTRATION';
  }
  send('Please, enter full name in right farmat: Surname Name.', 'none');
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
  console.log(sentMessage);
  console.log('start');
  return sentMessage === secret.adminPassword ? 'WAITING COMMAND' : 'WAITING PASSWORD AGAIN';
};

module.exports = {
  checkTourist,
  checkPassword
};
