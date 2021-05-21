'use strict';

const Place = require('../controller/meeting/place');
const Name = require('../controller/meeting/name');
const TourDate = require('../controller/meeting/date');
const Day = require('../controller/meeting/day');
const StartController = require('../controller/start/index');
const TimeController = require('../controller/time/index');
const WeatherController = require('../controller/weather/index');
const ExcursionController = require('../controller/excursions/index');
const MeetingController = require('../controller/meeting/index');
const MessageController = require('../controller/message/index');
const TourController = require('../controller/meeting/tour');
const HelpController = require('../controller/start/help');
const getUserStatus = require('../services/status_service');
const {
  ask,
  sendLocation,
  forward
} = require('../controller/utils/telegram_func');

// todo: split this files, it's to large

let tour = {};
const user = {};
// users: {
//   1: {
//     name:
//     state:
//     command:
//   }
//   2: {
//     name:
//     state:
//     command:
//   }
//  }

module.exports = async (fastify, opts) => { // eslint-disable-line no-unused-vars
  fastify.register(require('fastify-http-client'));
  fastify.get('/', () => ({ root: true }));

  fastify.post('/', async (req, res) => {
    if (!req.body.message || !req.body.message.chat || !req.body.message.chat.id) return;
    const chatId = req.body.message.chat.id;
    const sentMessage = req.body.message.text;
    if (!user[chatId]) {
      await userInit(chatId);
    }
    try {
      [user[chatId].state, user[chatId].command] = getUserStatus(sentMessage, chatId, user);
      const Mdb = require('../db/meeting-bot');
      const Traveler = Mdb.conn.models.traveler;
      Traveler.updateOne({ chat_id: chatId },
        {
          command: user[chatId].command,
          state: user[chatId].state
        },
        (err, doc) => {
          if (err) return console.error(err);
          return doc;
        });

      if (user[chatId].state === 'WAITING COMMAND'
        && user[chatId].command !== 'none'
        && user[chatId].command !== 'error') {
        callingCommands(req, res, fastify);
      } else {
        if (isAdminCommand(user[chatId].command)
          && user[chatId].state !== 'WAITING TOUR NAME') {
          [user[chatId].state, user[chatId].command, tour] = await tourChecker(req);
        }
        asking(user[chatId], chatId, fastify).then((response) => {
          res.status(200).send(response);
        }).catch((error) => {
          res.send(error);
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });
};

const userInit = async (chatId) => {
  const Mdb = require('../db/meeting-bot');
  user[chatId] = {};
  const Traveler = Mdb.conn.models.traveler;
  const voyager = await Traveler.findOne({ chat_id: chatId }, (err, docs) => {
    if (err) return console.error(err);
    return docs;
  });
  if (!voyager) {
    const mongoose = require('mongoose');
    Traveler.create(
      {
        _id: new mongoose.Types.ObjectId(),
        chat_id: chatId,
        command: 'none',
        state: 'WAITING COMMAND',
        name: 'unknown'
      },
      (err, doc) => {
        if (err) return console.error(err);
        return doc;
      }
    );
    user[chatId].command = 'none';
    user[chatId].state = 'WAITING COMMAND';
    user[chatId].name = 'unknown';
  } else {
    user[chatId].command = voyager.command;
    user[chatId].state = voyager.state;
    user[chatId].name = voyager.name;
  }
};

const callingCommands = async (req, res, fastify) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  if (isAdminCommand(user[chatId].command)) {
    user[chatId].state = await adminCommandHandler(req, tour,
      (chat, Message, keyboard, options) => {
        ask(Message, chat, fastify, keyboard, options).then((response) => {
          res.status(200).send(response);
        }).catch((error) => {
          res.send(error);
        });
      }, user,
      (chat, fromChatId, messageId) => {
        forward(chat, fromChatId, messageId, fastify).then((response) => {
          res.status(200).send(response);
        }).catch((error) => {
          res.send(error);
        });
      });
  } else {
    user[chatId].state = await commandHandler(req,
      (Message, keyboard) => {
        ask(Message, chatId, fastify, keyboard).then((response) => {
          res.status(200).send(response);
        }).catch((error) => {
          res.send(error);
        });
      }, user,
      (lat, lng) => {
        sendLocation(chatId, lat, lng, fastify).then((response) => {
          res.status(200).send(response);
        }).catch((error) => {
          res.send(error);
        });
      });
    if (user[chatId].command === 'tourist' && user[chatId].state === 'WAITING COMMAND') {
      const Mdb = require('../db/meeting-bot');
      user[chatId].name = sentMessage;
      const Traveler = Mdb.conn.models.traveler;
      Traveler.updateOne({ chat_id: chatId },
        {
          name: user[chatId].name
        },
        (err, doc) => {
          if (err) return console.error(err);
          return doc;
        });
    } else if (user[chatId].state === 'WAITING CHOICE AGAIN') {
      user[chatId].command = '/start';
    }
  }
};

const isAdminCommand = (command) => {
  if (command === 'Set meeting place'
    || command === 'Set meeting time'
    || command === 'Send message') {
    return true;
  }
  return false;
};

const tourChecker = async (req) => {
  const status = {};
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  const commandAdminFunctions = {
    'WAITING TOUR DATE': TourController.checkTourName,
    'WAITING DAY': TourController.checkTourDate,
    'WAITING MESSAGE': TourController.checkTourDate,
    'WAITING PLACE': TourController.checkDay,
    'WAITING TIME': TourController.checkDay
  };
  const stateHandler = commandAdminFunctions[user[chatId].state];
  [status.state, status.command, tour] = await stateHandler(user[chatId].command, sentMessage, tour);
  return [status.state, status.command, tour];
};

const commandHandler = (req, callback1, callback2, users) => {
  const chatId = req.body.message.chat.id;
  const commandFunctions = {
    tourist: StartController.checkTourist,
    '/time': TimeController.show,
    '/weather': WeatherController.show,
    '/excursions': ExcursionController.show,
    '/meeting': MeetingController.show,
    '/meeting direction': MeetingController.showDirection,
    '/help': HelpController.show,
    admin: StartController.checkPassword
  };
  const stateHandler = commandFunctions[user[chatId].command];
  return stateHandler(req, callback1, callback2, users);
};

const adminCommandHandler = (req, currentTour, users, callback1, callback2) => {
  const chatId = req.body.message.chat.id;
  const commandFunctions = {
    'Send message': MessageController.sendMessage,
    'Set meeting time': MeetingController.setTime,
    'Set meeting place': MeetingController.setPlace
  };
  const stateHandler = commandFunctions[user[chatId].command];
  return stateHandler(req, currentTour, users, callback1, callback2);
};

const asking = async (status, chatId, fastify) => {
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
      await adminAsking(status, chatId, fastify);
      break;
    }
    case 'Set meeting time': {
      await adminAsking(status, chatId, fastify);
      break;
    }
    case 'Set meeting place': {
      await adminAsking(status, chatId, fastify);
      break;
    }
    default: {
      await ask('Пожалуйста, следуйте инструкциям.', chatId, fastify, 'none');
    }
  }
};

const adminAsking = async (status, chatId, fastify) => {
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
