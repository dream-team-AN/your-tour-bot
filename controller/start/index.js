'use strict';

const Tourist = require('../../models/tourist');

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
  if (name.match(/^([А-Я]{1}[а-яёії]{1,15}|[A-Z]{1}[a-z]{1,15}) ([А-Я]{1}[а-яёії]{1,15}|[A-Z]{1}[a-z]{1,15})$/gm)) {
    return true;
  }
  return false;
};

const checkPassword = async (req, res) => {
  const sentMessage = req.body.message.text;
  console.log(req.body.message.text);
  console.log('start');
  return sentMessage === '12345' ? 'WAITING COMMAND' : 'WAITING PASSWORD AGAIN';
};

module.exports = {
  checkTourist,
  checkPassword
};
