'use strict';

const { ask, forward, sendLocation } = require('../other/telegram_service');
const StartHandler = require('../command/start_service');
const TimeHandler = require('../command/time_service');
const WeatherHandler = require('../command/weather_service');
const ExcursionHandler = require('../command/excursions_service');
const MeetingHandler = require('../command/meeting_service');
const HelpHandler = require('../command/help_service');
const MessageHandler = require('../command/message_service');
const { isAdminCommand } = require('./checking_status_service');

const callingCommand = async (message, fastify, reply, users, currentTour) => {
  const chatId = message.chat.id;
  const sendMany = (chat, Message, keyboard, options) => {
    ask(Message, chat, fastify, keyboard, options, currentTour)
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

  if (isAdminCommand(users[chatId].command)) {
    return await adminCommandHandler(message, chatId, currentTour, sendMany, users, forwardMess);
  }
  return await commandHandler(message, chatId, sendOne, users, sendLoc);
};

const commandHandler = (message, chatId, callback1, callback2, users) => {
  const commandFunctions = {
    tourist: StartHandler.checkTourist,
    '/time': TimeHandler.show,
    '/weather': WeatherHandler.show,
    '/excursions': ExcursionHandler.show,
    '/meeting': MeetingHandler.show,
    '/meeting direction': MeetingHandler.showDirection,
    '/help': HelpHandler.show,
    admin: StartHandler.checkPassword
  };
  const stateHandler = commandFunctions[users[chatId].command];
  return stateHandler(message, callback1, callback2, users);
};

const adminCommandHandler = (message, chatId, currentTour, callback1, callback2, users) => {
  const commandFunctions = {
    'Send message': MessageHandler.sendMessage,
    'Set meeting time': MeetingHandler.setTime,
    'Set meeting place': MeetingHandler.setPlace
  };
  const stateHandler = commandFunctions[users[chatId].command];
  return stateHandler(message, currentTour, users, callback1, callback2);
};

module.exports = callingCommand;
