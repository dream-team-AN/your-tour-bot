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
      send('Вы есть в нашей базе данных. Добро пожаловать в YourTourBot', 'none');
      return 'WAITING COMMAND';
    }

    send('Вы не были найдены в нашей базе данных. Пожалуйста, сначала купите тур в туристическом агентстве.', 'none');
    return 'WAITING REGISTRATION';
  }
  send('Пожалуйста, введите свое имя в корректном формате: Фамилия Имя', 'none');
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
    send('Пожалуйста, введите команду', 'admin');
  } else {
    send('Пароль неправильный. \n❌Вы не админ❌', 'simple');
  }
  return sentMessage === secret.adminPassword ? 'WAITING COMMAND' : 'WAITING CHOICE AGAIN';
};

module.exports = {
  checkTourist,
  checkPassword
};
