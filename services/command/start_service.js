'use strict';

const Tourist = require('../../repositories/your-tour-bot/tourist');
const regular = require('../../regular');

const checkTourist = async (message, send) => {
  const sentMessage = message.text;
  if (fullNameValidation(sentMessage)) {
    const tourists = await Tourist.getSome({ full_name: sentMessage });
    // eslint-disable-next-line no-console
    console.log(tourists);
    if (tourists.length === 1) {
      send('Вы есть в нашей базе данных. Добро пожаловать в YourTourBot.', 'none');
      return 'WAITING COMMAND';
    }

    send('Вы не были найдены в нашей базе данных. Пожалуйста, сначала купите тур в туристическом агентстве.', 'none');
    return 'WAITING REGISTRATION';
  }
  send('Пожалуйста, введите свое имя в корректном формате: Фамилия Имя', 'none');
  return 'WAITING NAME AGAIN';
};

const fullNameValidation = (name) => !!name.match(regular.validFullName);

const checkPassword = async (message, send) => {
  const sentMessage = message.text;
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
