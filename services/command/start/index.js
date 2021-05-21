'use strict';

const checkTourist = async (req, send) => {
  const sentMessage = req.body.message.text;
  if (fullNameValidation(sentMessage)) {
    let len;
    const Ydb = require('../../db/your-tour-bot');
    const Tourist = Ydb.conn.models.tourist;
    await Tourist.find({ full_name: sentMessage }, (err, docs) => {
      if (err) return console.error(err);
      len = docs.length;
      return docs;
    });
    if (len === 1) {
      send('Вы есть в нашей базе данных. Добро пожаловать в YourTourBot.', 'none');
      return 'WAITING COMMAND';
    }

    send('Вы не были найдены в нашей базе данных. Пожалуйста, сначала купите тур в туристическом агентстве.', 'none');
    return 'WAITING REGISTRATION';
  }
  send('Пожалуйста, введите свое имя в корректном формате: Фамилия Имя', 'none');
  return 'WAITING NAME AGAIN';
};

const fullNameValidation = (name) => {
  const regular = require('../../regular');
  return !!name.match(regular.validFullName);
};

const checkPassword = async (req, send) => {
  const sentMessage = req.body.message.text;
  if (sentMessage === process.env.ADMIN_PASSWORD) {
    send('Пожалуйста, введите команду', 'admin');
  } else {
    send('Пароль неправильный. \n❌Вы не админ❌', 'simple');
  }
  return sentMessage === process.env.ADMIN_PASSWORD ? 'WAITING COMMAND' : 'WAITING CHOICE AGAIN';
};

module.exports = {
  checkTourist,
  checkPassword
};