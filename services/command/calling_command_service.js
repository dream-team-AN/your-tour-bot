/* eslint-disable no-param-reassign */

'use strict';

const { ask, forward, sendLocation } = require('../other/telegram_service');
const StartController = require('../controller/start/index');
const TimeController = require('../controller/time/index');
const WeatherController = require('../controller/weather/index');
const ExcursionController = require('../controller/excursions/index');
const MeetingController = require('../controller/meeting/index');
const HelpController = require('../controller/start/help');
const MessageController = require('../controller/message/index');
const Check = require('../services/users/checking_status_service');
const Tour = require('../../controllers/tour');

const callingCommand = async (sentMessage, chatId, fastify, reply, users) => {
  const sendMany = (chat, Message, keyboard, options) => {
    ask(Message, chat, fastify, keyboard, options)
      .then((response) => { reply(response, 200); })
      .catch((error) => { reply(error, 500); });
  };

  const forwardMess = (chat, fromChatId, messageId) => {
    forward(chat, fromChatId, messageId, fastify)
      .then((response) => { reply(response, 200); })
      .catch((error) => { reply(error, 500); });
  };

  const sendOne = (Message, keyboard) => {
    ask(Message, chatId, fastify, keyboard)
      .then((response) => { reply(response, 200); })
      .catch((error) => { reply(error, 500); });
  };

  const sendLoc = (lat, lng) => {
    sendLocation(chatId, lat, lng, fastify)
      .then((response) => { reply(response, 200); })
      .catch((error) => { reply(error, 500); });
  };

  if (Check.isAdminCommand(users[chatId].command)) {
    users[chatId].state = await adminCommandHandler(sentMessage, chatId, Tour, sendMany, users, forwardMess);
  } else {
    users[chatId].state = await commandHandler(sentMessage, chatId, sendOne, users, sendLoc);
    if (users[chatId].state === 'WAITING CHOICE AGAIN') {
      users[chatId].command = '/start';
    }
  }
};

const commandHandler = (sentMessage, chatId, callback1, callback2, users) => {
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
  const stateHandler = commandFunctions[users[chatId].command];
  return stateHandler(sentMessage, chatId, callback1, callback2, users);
};

const adminCommandHandler = (sentMessage, chatId, currentTour, callback1, callback2, users) => {
  const commandFunctions = {
    'Send message': MessageController.sendMessage,
    'Set meeting time': MeetingController.setTime,
    'Set meeting place': MeetingController.setPlace
  };
  const stateHandler = commandFunctions[users[chatId].command];
  return stateHandler(sentMessage, chatId, currentTour, users, callback1, callback2);
};

module.exports = callingCommand;
