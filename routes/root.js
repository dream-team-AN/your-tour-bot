'use strict';

const StartController = require('@start/index');
const TimeController = require('@time/index');
const WeatherController = require('@weather/index');
const ExcursionController = require('@excursions/index');
const MeetingController = require('@meeting/index');
const MessageController = require('@message/index');
const TourController = require('@meeting/tour');
const secret = require('@root/secret.js');

const url = 'https://api.telegram.org/bot';
const user = {};
let tour = {};

module.exports = async (fastify) => {
  fastify.register(require('fastify-http-client'));
  fastify.get('/', async () => ({ root: true }));

  fastify.post('/', async (req, res) => {
    const chatId = req.body.message.chat.id;
    const sentMessage = req.body.message.text;
    if (!user[chatId]) {
      user[chatId] = {};
      user[chatId].command = 'none';
      user[chatId].state = 'WAITING COMMAND';
    }
    try {
      user[chatId] = getUserStatus(sentMessage, chatId);

      if (user[chatId].state === 'WAITING COMMAND'
      && user[chatId].command !== 'none'
      && user[chatId].command !== 'error') {
        user[chatId].state = await commandHandler(req, async (Message, keyboard) => {
          await ask(Message, chatId, fastify, keyboard);
        }).then((response) => {
          res.status(200).send(response);
        }).catch((error) => {
          res.send(error);
        });
      } else {
        if ((user[chatId].command === 'Set meeting place'
        || user[chatId].command === 'Set meeting time'
        || user[chatId].command === 'Send message')
        && user[chatId].state !== 'WAITING TOUR NAME') {
          user[chatId] = await tourChecker(req, res);
        }
        await asking(user[chatId], chatId, fastify).then((response) => {
          res.status(200).send(response);
        }).catch((error) => {
          res.send(error);
        });
      }
    } catch (err) {
      console.error(err);
    }
  });
};

const getUserStatus = (sentMessage, chatId) => {
  let status = {};

  if (user[chatId].state === 'WAITING COMMAND' || user[chatId].state === 'WAITING COMMAND AGAIN') {
    status = commandSwitcher(sentMessage, chatId);
  } else {
    status = textSwitcher(sentMessage, chatId);
  }
  return status;
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
      if (user[chatId].state === 'WAITING NAME' || user[chatId].state === 'WAITING NAME AGAIN') {
        status.command = 'tourist';
        status.state = 'WAITING COMMAND';
      } else if (user[chatId].state === 'WAITING REGISTRATION' && sentMessage === '/start') {
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
  } else if (user[chatId].command === 'admin' || administration.includes(user[chatId].command)) {
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
      if (command === commands[0]) status.state = 'WAITING CHOICE';
      else if (command === commands[3] || command === commands[4]) status.state = 'WAITING GEO';
      else status.state = 'WAITING COMMAND';
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
  return status;
};

const commandHandler = async (req, callback) => {
  const chatId = req.body.message.chat.id;
  const commandFunctions = {
    tourist: StartController.checkTourist,
    '/time': TimeController.show,
    '/weather': WeatherController.show,
    '/excursions': ExcursionController.show,
    '/meeting': MeetingController.show,
    admin: StartController.checkPassword,
    'Send message': MessageController.sendMessage,
    'Set meeting time': MeetingController.setTime,
    'Set meeting place': MeetingController.setPlace
  };
  const stateHandler = commandFunctions[user[chatId].command];
  return stateHandler(req, callback);
};

const asking = async (status, chatId, fastify) => {
  switch (status.command) {
    case 'error': {
      await ask('Please, enter a correct command.', chatId, fastify, 'none');
      break;
    }
    case '/start': {
      if (status.state === 'WAITING CHOICE') {
        await ask('Please, select the button on the keyboard at the bottom of your'
        + ' screen, corresponding to your status', chatId, fastify, 'simple');
      } else if (status.state === 'WAITING CHOICE AGAIN') {
        await ask('Please select one of the options on the keyboard ', chatId, fastify, 'simple');
      }
      break;
    }
    case 'tourist': {
      if (status.state === 'WAITING NAME') {
        await ask('Please enter your surname and name in English', chatId, fastify, 'none');
      } else if (status.state === 'WAITING NAME AGAIN') {
        await ask('Please enter again your surname and name in English', chatId, fastify, 'none');
      }
      break;
    }
    case '/time': {
      await ask('Do you agree to send us your location?', chatId, fastify, 'geo');
      break;
    }
    case '/weather': {
      await ask('Do you agree to send us your location?', chatId, fastify, 'geo');
      break;
    }
    case 'admin': {
      if (status.state === 'WAITING PASSWORD') {
        await ask('To access admin mode, please enter a password', chatId, fastify, 'none');
      } else if (status.state === 'WAITING PASSWORD AGAIN') {
        await ask('The password is incorrect. Please enter it again', chatId, fastify, 'none');
      } else if (status.state === 'WAITING COMMAND') {
        await ask('Please, select a command from the list', chatId, fastify, 'admin');
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
      await ask('Please follow the instructions', chatId, fastify, 'none');
    }
  }
};

const adminAsking = async (status, chatId, fastify) => {
  if (status.state === 'WAITING TOUR NAME') {
    await ask('Please enter tour name in English', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TOUR DATE') {
    await ask('Please enter tour date', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TOUR DAY') {
    await ask('Please enter tour day', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TIME') {
    await ask('Please enter a time for the meeting', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TOUR DATE AGAIN') {
    await ask('The tour date is wrong. Please enter tour date again', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TOUR DAY AGAIN') {
    await ask('The tour day is wrong. Please enter tour day again', chatId, fastify, 'none');
  } else if (status.state === 'WAITING TIME AGAIN') {
    await ask('The time is wrong. Please enter time again', chatId, fastify, 'none');
  } else if (status.state === 'WAITING PLACE') { // ??
    await ask('Please select a meeting place from the list with available places', chatId, fastify, 'none');
  } else if (status.state === 'WAITING PLACE AGAIN') {
    await ask('Place is incorrect. Please try again', chatId, fastify, 'none');
  } else if (status.state === 'WAITING MESSAGE') {
    await ask('Please enter a message', chatId, fastify, 'none');
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
