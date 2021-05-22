/* eslint-disable no-param-reassign */

'use strict';

const callingCommand = async (req, res, fastify, user, tour) => {
  const { ask, forward, sendLocation } = require('../command/utils/telegram_func');
  const chatId = req.body.message.chat.id;
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
    if (user[chatId].state === 'WAITING CHOICE AGAIN') {
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

const commandHandler = (req, callback1, callback2, users, user) => {
  const StartController = require('../controller/start/index');
  const TimeController = require('../controller/time/index');
  const WeatherController = require('../controller/weather/index');
  const ExcursionController = require('../controller/excursions/index');
  const MeetingController = require('../controller/meeting/index');
  const HelpController = require('../controller/start/help');
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

const adminCommandHandler = (req, currentTour, users, callback1, callback2, user) => {
  const MessageController = require('../controller/message/index');
  const MeetingController = require('../controller/meeting/index');
  const chatId = req.body.message.chat.id;
  const commandFunctions = {
    'Send message': MessageController.sendMessage,
    'Set meeting time': MeetingController.setTime,
    'Set meeting place': MeetingController.setPlace
  };
  const stateHandler = commandFunctions[user[chatId].command];
  return stateHandler(req, currentTour, users, callback1, callback2);
};

module.exports = callingCommand;
