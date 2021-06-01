'use strict';

const { ask } = require('../other/telegram_service');

const asking = async (status, chatId, fastify, tour) => {
  switch (status.command) {
    case 'error': {
      await ask('Пожалуйста, введите правильную команду или /start.', chatId, fastify, 'none');
      break;
    }
    case '/start': {
      if (status.state === 'WAITING CHOICE') {
        await ask('Пожалуйста, выберите кнопку на клавиатуре, которая находится внизу вашего экрана, '
          + 'что бы подтвердить свой статус.', chatId, fastify, 'simple');
      } else if (status.state === 'WAITING CHOICE AGAIN') {
        await ask('Пожалуйста, выберите один из вариантов на клавиатуре.', chatId, fastify, 'simple');
      }
      break;
    }
    case 'tourist': {
      if (status.state === 'WAITING NAME') {
        await ask('Пожалуйста, введите свои фамилию и имя.', chatId, fastify, 'none');
      } else if (status.state === 'WAITING NAME AGAIN') {
        await ask('Пожалуйста, введите свои фамилию и имя ещё раз.', chatId, fastify, 'none');
      }
      break;
    }
    case '/time': {
      await ask('Вы согласны поделиться своей локацией?', chatId, fastify, 'geo');
      break;
    }
    case '/weather': {
      await ask('Вы согласны поделиться своей локацией?', chatId, fastify, 'geo');
      break;
    }
    case 'admin': {
      if (status.state === 'WAITING PASSWORD') {
        await ask('Что бы войти в режим администратора введите пароль.', chatId, fastify, 'none');
      } else if (status.state === 'WAITING PASSWORD AGAIN') {
        await ask('Пароль неправильный. Пожалуйста, введите его ещё раз.', chatId, fastify, 'none');
      } else if (status.state === 'WAITING COMMAND') {
        await ask('Пожалуйста, выберите команду из списка.', chatId, fastify, 'admin');
      } else if (status.state === 'WAITING COMMAND AGAIN') {
        await ask('Пожалуйста, выберите команду из списка или введите /start.', chatId, fastify, 'admin');
      }
      break;
    }
    case 'Send message': {
      await adminAsking(status, chatId, fastify, tour);
      break;
    }
    case 'Set meeting time': {
      await adminAsking(status, chatId, fastify, tour);
      break;
    }
    case 'Set meeting place': {
      await adminAsking(status, chatId, fastify, tour);
      break;
    }
    default: {
      await ask('Пожалуйста, следуйте инструкциям.', chatId, fastify, 'none');
    }
  }
};

const adminAsking = async (status, chatId, fastify, tour) => {
  switch (status.state) {
    case 'WAITING TOUR NAME': {
      await ask('Пожалуйста, введите или выберите название тура.', chatId, fastify, 'name', tour);
      break;
    }
    case 'WAITING TOUR DATE': {
      await ask('Пожалуйста, введите или выберите дату начала тура в формате год-месяц-день.', chatId, fastify, 'date', tour);
      break;
    }
    case 'WAITING DAY': {
      await ask('Пожалуйста, введите или выберите день тура.', chatId, fastify, 'day', tour);
      break;
    }
    case 'WAITING TIME': {
      await ask('Пожалуйста, введите время встречи.', chatId, fastify, 'none');
      break;
    }
    case 'WAITING TOUR DATE AGAIN': {
      await ask('Дата начала тура введена в некорректном формате. Пожалуйста, введите снова.', chatId, fastify, 'date', tour);
      break;
    }
    case 'WAITING DAY AGAIN': {
      await ask('День тура введён в некорректном формате. Пожалуйста, введите снова.', chatId, fastify, 'day', tour);
      break;
    }
    case 'WAITING PLACE': {
      await ask('Пожалуйста, выберите место встречи из списка доступных мест.', chatId, fastify, 'place', tour);
      break;
    }
    case 'WAITING MESSAGE': {
      await ask('Пожалуйста, введите сообщение.', chatId, fastify, 'none');
      break;
    }
    default: {
      await ask('Пожалуйста, следуйте инструкциям.', chatId, fastify, 'none');
    }
  }
};

module.exports = asking;
