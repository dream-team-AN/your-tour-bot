'use strict';

const getStatus = (sentMessage, chatId, user) => {
  let status = {};

  if (user.state === 'WAITING CHOICE AGAIN') {
    status.command = '/start';
  }
  if (user.state === 'WAITING COMMAND'
      || user.state === 'WAITING COMMAND AGAIN') {
    status = commandSwitcher(sentMessage, user);
  } else {
    status = textSwitcher(sentMessage, chatId, user);
  }
  return [status.state, status.command];
};

const textSwitcher = (sentMessage, chatId, user) => {
  let status = {};
  switch (user.command) {
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
      if (user.state === 'WAITING NAME'
          || user.state === 'WAITING NAME AGAIN') {
        status.command = 'tourist';
        status.state = 'WAITING COMMAND';
      } else if (user.state === 'WAITING REGISTRATION'
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
    case '/meeting': {
      if (user.state === 'WAITING GEO') {
        status.command = '/meeting direction';
        status.state = 'WAITING COMMAND';
      } else {
        status.command = '/meeting';
        status.state = 'WAITING COMMAND';
      }

      break;
    }
    case 'admin': {
      if (user.state !== 'WAITING COMMAND AGAIN') {
        status.command = 'admin';
        status.state = 'WAITING COMMAND';
      }
      break;
    }
    case 'Send message': {
      status = adminSwitcher(user, 'WAITING MESSAGE', 'Send message');
      break;
    }
    case 'Set meeting time': {
      status = adminSwitcher(user, 'WAITING TIME', 'Set meeting time');
      break;
    }
    case 'Set meeting place': {
      status = adminSwitcher(user, 'WAITING PLACE', 'Set meeting place');
      break;
    }
    default: {
      status.command = 'error';
      status.state = 'WAITING COMMAND';
    }
  }
  return status;
};

const commandSwitcher = (sentMessage, user) => {
  const commands = ['/start', '/help', '/excursions', '/time', '/weather', '/meeting'];
  const administration = ['Set meeting place', 'Set meeting time', 'Send message'];
  let status = {};
  if (user.command === 'none') {
    status.state = sentMessage === '/start' ? 'WAITING CHOICE' : 'WAITING COMMAND';
    status.command = sentMessage === '/start' ? '/start' : 'none';
  } else if (commands.includes(sentMessage)) {
    status = touristCommandSwitcher(sentMessage, commands);
  } else if (user.command === 'admin'
      || administration.includes(user.command)) {
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

const adminSwitcher = (user, condition, action) => {
  const status = { command: action };
  switch (user.state) {
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
    case `${condition} AGAIN`: {
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

module.exports = getStatus;
