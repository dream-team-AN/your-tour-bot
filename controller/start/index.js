'use strict';

const Tourist = require('../../models/tourist');
const secret = require('../../secret.js');
const regular = require('../../regular');

const checkTourist = async (req, res) => {
  const sentMessage = req.body.message.text;
  if (fullNameValidation(sentMessage)) {
    let len;
    await Tourist.find({ full_name: sentMessage }, (err, docs) => {
      if (err) return console.error(err);
      len = docs.length;
      return docs;
    });
    console.log(len);
    return len === 1 ? 'WAITING COMMAND' : 'WAITING REGISTRATION';
  }
  return 'WAITING NAME AGAIN';
};

const fullNameValidation = (name) => {
  if (name.match(regular.validFullName)) {
    return true;
  }
  return false;
};

const checkPassword = async (req, res) => {
  const sentMessage = req.body.message.text;
  console.log(req.body.message.text);
  console.log('start');
  return sentMessage === secret.adminPassword ? 'WAITING COMMAND' : 'WAITING PASSWORD AGAIN';
};

module.exports = {
  checkTourist,
  checkPassword
};
