'use strict';

const getStatus = require('../services/user/getting_status_service');
const callingCommand = require('../services/user/calling_command_service');
const asking = require('../services/user/asking_service');
const Check = require('../services/user/checking_status_service');
const Trip = require('./trip');
const Voyager = require('../services/user/setting_status_service');

// User {
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

class User {
  setStatus(sentMessage, chatId) {
    [this[chatId].state, this[chatId].command] = getStatus(sentMessage, chatId, this[chatId]);
    Voyager.setState(chatId, this[chatId].state);
    Voyager.setCommand(chatId, this[chatId].command);
  }

  async init(chatId) {
    this[chatId] = {};
    const tourer = Voyager.get(chatId);
    if (!tourer) {
      Voyager.setAllNull(chatId);
      this[chatId].command = 'none';
      this[chatId].state = 'WAITING COMMAND';
      this[chatId].name = 'unknown';
    } else {
      this[chatId].command = tourer.command;
      this[chatId].state = tourer.state;
      this[chatId].name = tourer.name;
    }
  }

  async callCommand(message, fastify, reply) {
    const chatId = message.chat.id;
    const sentMessage = message.text;
    if (Check.isWaitingProcessing(this[chatId])) {
      this[chatId].state = await callingCommand(message, fastify, reply, this, Trip);
    } else {
      if (Check.isAdminCommand(this[chatId].command) && !Check.isWaitingTourName(this[chatId].state)) {
        [this[chatId].state, this[chatId].command] = await Trip.getUserStatus(sentMessage, this[chatId]);
      }
      asking(this[chatId], chatId, fastify, Trip).then((response) => {
        reply(response, 200);
      }).catch((error) => {
        reply(error, 500);
      });
    }
  }

  async setName(chatId, name) {
    if (Check.isUnregistratedTourist(this[chatId])) {
      this[chatId].name = name;
      Voyager.setName(chatId, this[chatId].name);
    }
  }
}

module.exports = new User();
