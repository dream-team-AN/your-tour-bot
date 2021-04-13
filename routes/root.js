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
    user[chatId] = getUserStatus(sentMessage, chatId);
    if (user[chatId].state === 'WAITING COMMAND'
      && user[chatId].command !== 'none'
      && user[chatId].command !== 'error') {
      console.log('yeeeeeeeeeeeees');
      let result = 'absence';
      [user[chatId].state, result = 'absence'] = await commandHandler(req, res);
      await ask(result, chatId, fastify).then((response) => {
        res.status(200).send(response);
      }).catch((error) => {
        res.send(error);
      });
    } else {
      console.log('nooooooooooooooooooooooooo');
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
  });
};

const getUserStatus = (sentMessage, chatId) => {
  let status = {};
  console.log('Previous info');
  console.log(sentMessage);
  console.log(`${user[chatId].state}/////////////`);
  console.log(`${user[chatId].command}/////////////`);

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
      status.state = command === commands[0] ? 'WAITING CHOICE' : 'WAITING COMMAND';
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
  return status;
};

const commandHandler = async (req, res) => {
  const chatId = req.body.message.chat.id;
  const commandFunctions = {
    tourist: StartController.checkTourist,
    '/time': TimeController.show,
    '/weather': WeatherController.show,
    '/excursions': ExcursionController.show,
    '/meeting': MeetingController.show,
    admin: StartController.checkPassword,
    'Send message': MessageController.send,
    'Set meeting time': MeetingController.setTime,
    'Set meeting place': MeetingController.setPlace
  };
  const stateHandler = commandFunctions[user[chatId].command];
  return stateHandler(req, res);
};

const asking = async (status, chatId, fastify) => {
  switch (status.command) {
    case 'none': {
      await ask('You were not found in our database. Please buy a tour from our travel agency.', chatId, fastify);
      break;
    }
    case 'error': {
      await ask('Please, enter a correct command.', chatId, fastify);
      break;
    }
    case '/start': {
      if (status.state === 'WAITING CHOICE') {
        await ask('Please, select the button on the keyboard at the bottom of your'
        + ' screen, corresponding to your status', chatId, fastify);
      } else if (status.state === 'WAITING CHOICE AGAIN') {
        await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
      }
      break;
    }
    case 'tourist': {
      if (status.state === 'WAITING NAME') await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
      else if (status.state === 'WAITING NAME AGAIN') await ask(`asg${status.command}    ${status.state}`, chatId, fastify);
      break;
    }
    case 'admin': {
      if (status.state === 'WAITING PASSWORD') await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
      else if (status.state === 'WAITING PASSWORD AGAIN') await ask(`ag${status.command}  ${status.state}`, chatId, fastify);
      break;
    }
    case 'Send message': {
      await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
      break;
    }
    case 'Set meeting time': {
      await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
      break;
    }
    case 'Set meeting place': {
      await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
      break;
    }
    default: {
      await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
    }
  }
  console.log(`console.log asking${status.command}       ${status.state}`);
};

const adminAsking = async (status, chatId, fastify) => {
  if (status.state === 'WAITING TOUR NAME') await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
  else if (status.state === 'WAITING TOUR DATE') await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
  else if (status.state === 'WAITING TOUR DAY') await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
  else if (status.state === 'WAITING TIME') await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
  else if (status.state === 'WAITING TOUR DATE AGAIN') await ask(`asking${status.command} ${status.state}`, chatId, fastify);
  else if (status.state === 'WAITING TOUR DAY AGAIN') await ask(`asking${status.command}  ${status.state}`, chatId, fastify);
  else if (status.state === 'WAITING TIME AGAIN') await ask(`asking${status.command}  ${status.state}`, chatId, fastify);
  else if (status.state === 'WAITING PLACE') await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
  else if (status.state === 'WAITING PLACE AGAIN') await ask(`asking${status.command}   ${status.state}`, chatId, fastify);
  else if (status.state === 'WAITING MESSAGE') await ask(`asking${status.command}       ${status.state}`, chatId, fastify);
};

const ask = async (Message, chatId, fastify) => {
  await fastify.httpclient.request(`${url}${secret.TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    content: JSON.stringify({
      chat_id: chatId,
      text: Message
      // reply_markup: {
      //   keyboard: ['tourist', 'admin']
      // }
    })
  });
};
