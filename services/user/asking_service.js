'use strict';

const { ask } = require('../other/telegram_service');
const Place = require('../controller/meeting/place');
const Name = require('../controller/meeting/name');
const TourDate = require('../controller/meeting/date');
const Day = require('../controller/meeting/day');

const asking = async (status, chatId, fastify, tour) => {
  switch (status.command) {
    case 'error': {
      await ask('Пожалуйста, введите правильную комманду или /start.', chatId, fastify, 'none');
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
      Name.choose(async (names) => {
        await ask('Пожалуйста, введите или выберите название тура.', chatId, fastify, 'tour_info', names);
      });
      break;
    }
    case 'WAITING TOUR DATE': {
      TourDate.choose(tour, async (dates) => {
        await ask('Пожалуйста, введите или выберите дату начала тура в формате год-месяц-день.', chatId, fastify, 'tour_info', dates);
      });
      break;
    }
    case 'WAITING DAY': {
      Day.choose(tour, async (days) => {
        await ask('Пожалуйста, введите или выберите день тура.', chatId, fastify, 'tour_info', days);
      });
      break;
    }
    case 'WAITING TIME': {
      await ask('Пожалуйста, введите время встречи.', chatId, fastify, 'none');
      break;
    }
    case 'WAITING TOUR DATE AGAIN': {
      TourDate.choose(tour, async (dates) => {
        await ask('Дата начала тура введена в некорректном фомате. Пожалуйста, введите снова.', chatId, fastify, 'tour_info', dates);
      });
      break;
    }
    case 'WAITING DAY AGAIN': {
      Day.choose(tour, async (days) => {
        await ask('День тура введён в некорректном фомате. Пожалуйста, введите снова.', chatId, fastify, 'tour_info', days);
      });
      break;
    }
    case 'WAITING PLACE': {
      Place.choose(tour, async (places) => {
        await ask('Пожалуйста, выберите место встречи из списка доступных мест.', chatId, fastify, 'tour_info', places);
      });
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
