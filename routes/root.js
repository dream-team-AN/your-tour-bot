'use strict';

const StartController = require('@start/index');
const TimeController = require('@time/index');
const WeatherController = require('@weather/index');
const ExcursionController = require('@excursions/index');
const MeetingController = require('@meeting/index');
const MessageController = require('@message/index');
const TourController = require('@meeting/tour');
const HelpController = require('@start/help');
const secret = require('@root/secret.js');

const url = 'https://api.telegram.org/bot';
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
  fastify.get('/', async () => ({ root: true }));

  fastify.post('/', async (req, res) => {
    const chatId = req.body.message.chat.id;
    const sentMessage = req.body.message.text;
    console.log(req.body);
    if (!user[chatId]) {
      user[chatId] = {};
      user[chatId].command = 'none';
      user[chatId].state = 'WAITING COMMAND';
      user[chatId].name = 'unknown';
    }
    console.log('????????');
    console.log(user);
    console.log('????????');
    try {
      [user[chatId].state, user[chatId].command] = getUserStatus(sentMessage, chatId);

      if (user[chatId].state === 'WAITING COMMAND'
      && user[chatId].command !== 'none'
      && user[chatId].command !== 'error') {
        await callingCommands(req, res, fastify);
      } else {
        if (isAdminCommand(user[chatId].command)
        && user[chatId].state !== 'WAITING TOUR NAME') {
          [user[chatId].state, user[chatId].command, tour] = await tourChecker(req, res);
        }
        await asking(user[chatId], chatId, fastify).then((response) => {
          res.status(204).send(response);
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

const callingCommands = async (req, res, fastify) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;
  if (isAdminCommand(user[chatId].command)) {
    user[chatId].state = await adminCommandHandler(req, tour, user,
      async (chat, Message, keyboard) => {
        await ask(Message, chat, fastify, keyboard).then((response) => {
          res.status(204).send(response);
        }).catch((error) => {
          res.send(error);
        });
      }, async (chat, fromChatId, messageId) => {
        await forward(chat, fromChatId, messageId, fastify).then((response) => {
          res.status(204).send(response);
        }).catch((error) => {
          res.send(error);
        });
      });
  } else {
    user[chatId].state = await commandHandler(req, async (Message, keyboard) => {
      await ask(Message, chatId, fastify, keyboard).then((response) => {
        res.status(204).send(response);
      }).catch((error) => {
        res.send(error);
      });
    }, user);
    if (user[chatId].command === 'tourist' && user[chatId].state === 'WAITING COMMAND') {
      user[chatId].name = sentMessage;
    } else if (user[chatId].state === 'WAITING CHOICE AGAIN') {
      console.log('startstartstartstartstartstart');
      user[chatId].command = '/start';
    }
    console.log(user[chatId]);
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

const getUserStatus = (sentMessage, chatId) => {
  let status = {};
  console.log('Previous info');
  console.log(sentMessage);
  console.log(`${user[chatId].state}/////////////`);
  console.log(`${user[chatId].command}/////////////`);

  if (user[chatId].state === 'WAITING COMMAND'
  || user[chatId].state === 'WAITING COMMAND AGAIN') {
    status = commandSwitcher(sentMessage, chatId);
  } else {
    status = textSwitcher(sentMessage, chatId);
  }
  return [status.state, status.command];
};

const textSwitcher = (sentMessage, chatId) => {
  let status = {};
  switch (user[chatId].command) {
    case '/start': {
      switch (sentMessage) {
        case 'tourist': {
          status.command = 'tourist';
          status.state = 'WAITING NAME';
          break;
        }
        case 'admin': {
          status.command = 'admin';
          status.state = 'WAITING PASSWORD';
          break;
        }
        default: {
          status.command = '/start';
          status.state = 'WAITING CHOICE AGAIN';
        }
      }
      break;
    }
    case 'tourist': {
      if (user[chatId].state === 'WAITING NAME'
      || user[chatId].state === 'WAITING NAME AGAIN') {
        status.command = 'tourist';
        status.state = 'WAITING COMMAND';
      } else if (user[chatId].state === 'WAITING REGISTRATION'
      && sentMessage === '/start') {
        status.command = sentMessage;
        status.state = 'WAITING CHOICE';
      } else {
        status.command = 'none';
        status.state = 'WAITING COMMAND';
      }
      break;
    }
    case '/time': {
      status.command = '/time';
      status.state = 'WAITING COMMAND';
      break;
    }
    case '/weather': {
      status.command = '/weather';
      status.state = 'WAITING COMMAND';
      break;
    }
    case 'admin': {
      if (user[chatId].state !== 'WAITING COMMAND AGAIN') {
        status.command = 'admin';
        status.state = 'WAITING COMMAND';
      }
      break;
    }
    case 'Send message': {
      status = adminSwitcher(chatId, 'WAITING MESSAGE', 'Send message');
      break;
    }
    case 'Set meeting time': {
      status = adminSwitcher(chatId, 'WAITING TIME', 'Set meeting time');
      break;
    }
    case 'Set meeting place': {
      status = adminSwitcher(chatId, 'WAITING PLACE', 'Set meeting place');
      break;
    }
    default: {
      status.command = 'error';
      status.state = 'WAITING COMMAND';
    }
  }
  return status;
};

const commandSwitcher = (sentMessage, chatId) => {
  const commands = ['/start', '/help', '/excursions', '/time', '/weather', '/meeting'];
  const administration = ['Set meeting place', 'Set meeting time', 'Send message'];
  let status = {};
  if (user[chatId].command === 'none') {
    status.state = sentMessage === '/start' ? 'WAITING CHOICE' : 'WAITING COMMAND';
    status.command = sentMessage === '/start' ? '/start' : 'none';
  } else if (commands.includes(sentMessage)) {
    status = touristCommandSwitcher(sentMessage, commands);
  } else if (user[chatId].command === 'admin'
  || administration.includes(user[chatId].command)) {
    status = adminCommandSwitcher(sentMessage, administration);
  } else {
    status.command = 'error';
    status.state = 'WAITING COMMAND';
  }
  return status;
};

const touristCommandSwitcher = (sentMessage, commands) => {
  const status = {};
  commands.forEach((command) => {
    if (sentMessage === command) {
      status.command = command;
      if (command === commands[0]) {
        status.state = 'WAITING CHOICE';
      } else if (command === commands[3] || command === commands[4]) {
        status.state = 'WAITING GEO';
      } else {
        status.state = 'WAITING COMMAND';
      }
    }
  });
  return status;
};

const adminCommandSwitcher = (sentMessage, administration) => {
  const status = {};
  if (administration.includes(sentMessage)) {
    administration.forEach((command) => {
      if (sentMessage === command) {
        status.command = command;
        status.state = 'WAITING TOUR NAME';
      }
    });
  } else {
    status.command = 'admin';
    status.state = 'WAITING COMMAND AGAIN';
  }
  return status;
};
const adminSwitcher = (chatId, condition, action) => {
  const status = { command: action };
  switch (user[chatId].state) {
    case 'WAITING TOUR NAME': {
      status.state = 'WAITING TOUR DATE';
      break;
    }
    case 'WAITING TOUR DATE': {
      status.state = action === 'Send message' ? 'WAITING MESSAGE' : 'WAITING DAY';
      break;
    }
    case 'WAITING DAY': {
      status.state = condition;
      break;
    }
    case condition: {
      status.state = 'WAITING COMMAND';
      break;
    }
    case 'WAITING TOUR DATE AGAIN': {
      status.state = 'WAITING DAY';
      break;
    }
    case 'WAITING DAY AGAIN': {
      status.state = condition;
      break;
    }
    case `${condition}AGAIN`: {
      status.state = 'WAITING COMMAND';
      break;
    }
    default: {
      status.command = 'error';
      status.state = 'WAITING COMMAND';
    }
  }
  return status;
};

const tourChecker = async (req, res) => {
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
  console.log(tour);
  return [status.state, status.command, tour];
};

const commandHandler = async (req, users, callback) => {
  const chatId = req.body.message.chat.id;
  const commandFunctions = {
    tourist: StartController.checkTourist,
    '/time': TimeController.show,
    '/weather': WeatherController.show,
    '/excursions': ExcursionController.show,
    '/meeting': MeetingController.show,
    '/help': HelpController.show,
    admin: StartController.checkPassword
  };
  const stateHandler = commandFunctions[user[chatId].command];
  return stateHandler(req, users, callback);
};

const adminCommandHandler = async (req, currentTour, users, callback1, callback2) => {
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
      await ask('Пожалуйста, введите правильную комманду.', chatId, fastify, 'none');
      break;
    }
    case '/start': {
      if (status.state === 'WAITING CHOICE') {
        await ask('Пожалуйста, выберите кнопку на клавиатуре, которая находится внизу вашего экрана, '
        + 'что бы подтвердить свой статус.', chatId, fastify, 'simple');
      } else if (status.state === 'WAITING CHOICE AGAIN') {
        await ask('Пожалуйста, выберите один из вариантов на клавиатуре.', chatId, fastify, 'none');
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
  console.log(`console.log asking${status.command}       ${status.state}`);
};

const adminAsking = async (status, chatId, fastify) => {
  if (status.state === 'WAITING TOUR NAME') {
    await ask('Пожалуйста, введите название тура.', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TOUR DATE') {
    await ask('Пожалуйста, введите дату в формате год-месяц-день.', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TOUR DAY') {
    await ask('Пожалуйста, введите день тура.', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TIME') {
    await ask('Пожалуйста, введите время встречи.', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TOUR DATE AGAIN') {
    await ask('Дата тура введена в некорректном фомате. Пожалуйста, введите дату тура снова.', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TOUR DAY AGAIN') {
    await ask('День тура введён в некорректном фомате. Пожалуйста, введите день тура снова.', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TIME AGAIN') {
    await ask('Время введено в некорректном формате. Пожалуйста, введите время снова.', chatId, fastify, 'none');
  } else if (status.state === 'WAITING PLACE') {
    await ask('Пожалуйста, выберите место встречи из списка доступных мест.', chatId, fastify, 'none');
  } else if (status.state === 'WAITING PLACE AGAIN') {
    await ask('Место встречи некорректное. Пожалуйста, попробуйте снова.', chatId, fastify, 'none');
  } else if (status.state === 'WAITING MESSAGE') {
    await ask('Пожалуйста, введите сообщение.', chatId, fastify, 'none');
  }
};

const ask = async (Message, chatId, fastify, keyboard) => {
  const mess = {
    chat_id: chatId,
    text: Message
  };
  if (keyboard === 'admin') {
    mess.reply_markup = {
      keyboard: [['Set meeting place'], ['Set meeting time'], ['Send message']]
    };
  } else if (keyboard === 'simple') {
    mess.reply_markup = {
      keyboard: [['tourist'], ['admin']]
    };
  } else if (keyboard === 'geo') {
    mess.reply_markup = {
      keyboard: [
        [{
          text: 'Send location',
          request_location: true
        }],
        [{
          text: 'Cancel operation'
        }
        ]
      ]
    };
  } else {
    mess.reply_markup = { remove_keyboard: true };
  }
  await fastify.httpclient.request(`${url}${secret.TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    content: JSON.stringify(mess)
  });
};

const forward = async (chatId, fromChatId, messageId, fastify) => {
  const mess = {
    chat_id: chatId,
    from_chat_id: fromChatId,
    message_id: messageId
  };
  await fastify.httpclient.request(`${url}${secret.TOKEN}/forwardMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    content: JSON.stringify(mess)
  });
};
