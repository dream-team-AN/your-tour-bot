/* eslint-disable class-methods-use-this */

'use strict';

const mongoose = require('mongoose');
const getStatus = require('../services/user/getting_status_service');
const Mdb = require('../db/meeting-bot');
const { callingCommand } = require('../services/command/calling_command_service');
const asking = require('../services/user/asking_service');
const Check = require('../services/user/checking_status_service');
const Tour = require('./tour');
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
    const Traveler = Mdb.conn.models.traveler;
    Traveler.updateOne({ chat_id: chatId },
      {
        command: this[chatId].command,
        state: this[chatId].state
      },
      (err, doc) => {
        if (err) return console.error(err);
        return doc;
      });
  }

  async init(chatId) {
    this[chatId] = {};
    const Traveler = Mdb.conn.models.traveler;
    const voyager = await Traveler.findOne({ chat_id: chatId }, (err, docs) => {
      if (err) return console.error(err);
      return docs;
    });
    if (!voyager) {
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
      this[chatId].command = 'none';
      this[chatId].state = 'WAITING COMMAND';
      this[chatId].name = 'unknown';
    } else {
      this[chatId].command = voyager.command;
      this[chatId].state = voyager.state;
      this[chatId].name = voyager.name;
    }
  }

  async callCommand(sentMessage, chatId, fastify, reply) {
    if (Check.isWaitingProcessing(this[chatId])) {
      callingCommand(sentMessage, chatId, fastify, reply, this);
    } else {
      if (Check.isAdminCommand(this[chatId].command) && Check.isWaitingTourName(this[chatId].state)) {
        [this[chatId].state, this[chatId].command] = await Tour.getUserStatus(sentMessage, this[chatId]);
      }
      asking(this[chatId], chatId, fastify, this.tour).then((response) => {
        reply(response, 200);
      }).catch((error) => {
        reply(error, 500);
      });
    }
  }

  async setName(chatId, name) {
    if (Check.isUnregistratedTourist(this[chatId])) {
      this[chatId].name = name;
      const Traveler = Mdb.conn.models.traveler;
      Traveler.updateOne({ chat_id: chatId },
        {
          name: this[chatId].name
        },
        (err, doc) => {
          if (err) return console.error(err);
          return doc;
        });
    }
  }
}

module.exports = new User();
